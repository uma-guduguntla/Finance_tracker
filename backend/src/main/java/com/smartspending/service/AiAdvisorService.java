package com.smartspending.service;

import com.smartspending.entity.Expense;
import com.smartspending.repository.ExpenseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiAdvisorService {

    private static final Logger log = LoggerFactory.getLogger(AiAdvisorService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    @Autowired
    private ExpenseRepository expenseRepository;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String getFinancialAdvice(Long userId) {
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);

        if (expenses.isEmpty()) {
            return "You haven't added any expenses yet. Start tracking your spending to get personalized financial advice!";
        }

        String summary = buildSpendingSummary(expenses);
        String prompt = buildPrompt(summary);

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            return "Unable to generate advice right now. Please try again later.";
        }
    }

    public String getLeakAdvice(Long userId, String leakType, String leakDescription) {
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);
        String summary = buildSpendingSummary(expenses);

        String prompt = "You are a financial advisor AI for a personal spending tracker app called Smart Spend.\n\n" +
                "The user has the following spending leak detected:\n" +
                "Type: " + leakType + "\n" +
                "Details: " + leakDescription + "\n\n" +
                "Here's their spending summary:\n" + summary + "\n\n" +
                "Give 3 specific, actionable tips to fix this particular spending leak. " +
                "Be concise, practical, and encouraging. Use plain text, no markdown formatting.";

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            log.error("Gemini API call failed for leak advice: {}", e.getMessage(), e);
            return "Unable to generate advice for this leak right now.";
        }
    }

    private String buildSpendingSummary(List<Expense> expenses) {
        LocalDate now = LocalDate.now();
        LocalDate thirtyDaysAgo = now.minusDays(30);

        List<Expense> recent = expenses.stream()
                .filter(e -> e.getDate().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());

        BigDecimal totalAll = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total30 = recent.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> categoryTotals = recent.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));

        BigDecimal dailyAvg = total30.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);

        StringBuilder sb = new StringBuilder();
        sb.append("Total expenses (all time): $").append(totalAll.setScale(2, RoundingMode.HALF_UP)).append("\n");
        sb.append("Last 30 days total: $").append(total30.setScale(2, RoundingMode.HALF_UP)).append("\n");
        sb.append("Daily average (30 days): $").append(dailyAvg).append("\n");
        sb.append("Number of transactions (30 days): ").append(recent.size()).append("\n");
        sb.append("Total transactions (all time): ").append(expenses.size()).append("\n\n");
        sb.append("Category breakdown (last 30 days):\n");

        categoryTotals.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .forEach(entry -> {
                    BigDecimal pct = total30.compareTo(BigDecimal.ZERO) > 0
                            ? entry.getValue().multiply(BigDecimal.valueOf(100)).divide(total30, 1, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    sb.append("  - ").append(entry.getKey()).append(": $")
                            .append(entry.getValue().setScale(2, RoundingMode.HALF_UP))
                            .append(" (").append(pct).append("%)\n");
                });

        // Top 3 most frequent expenses
        Map<String, Long> freqMap = recent.stream()
                .collect(Collectors.groupingBy(e -> e.getDescription().toLowerCase().trim(), Collectors.counting()));
        sb.append("\nMost frequent expenses:\n");
        freqMap.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(3)
                .forEach(entry -> sb.append("  - \"").append(entry.getKey()).append("\" (").append(entry.getValue()).append(" times)\n"));

        return sb.toString();
    }

    private String buildPrompt(String summary) {
        return "You are a smart financial advisor AI for a personal spending tracker app called Smart Spend.\n\n" +
                "Here is the user's spending data:\n" + summary + "\n" +
                "Based on this data, provide:\n" +
                "1. A brief assessment of their spending habits (2-3 sentences)\n" +
                "2. Top 3 specific, actionable savings recommendations\n" +
                "3. One encouraging note about something they're doing well (if applicable)\n\n" +
                "Be concise, friendly, and practical. Use plain text only, no markdown formatting or special characters. " +
                "Keep the total response under 250 words.";
    }

    private String callGemini(String prompt) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model +
                ":generateContent?key=" + apiKey;

        // Escape the prompt for JSON
        String escapedPrompt = prompt
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");

        String requestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + escapedPrompt + "\"}]}]," +
                "\"generationConfig\":{\"temperature\":0.7,\"maxOutputTokens\":500}}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Gemini API error: status={}, body={}", response.statusCode(), response.body());
            throw new RuntimeException("Gemini API returned status " + response.statusCode());
        }

        // Parse the response to extract text
        String body = response.body();
        return extractTextFromResponse(body);
    }

    private String extractTextFromResponse(String jsonResponse) {
        // Simple JSON parsing without external library
        // Looking for: "text": "..." in the response
        int textIdx = jsonResponse.indexOf("\"text\"");
        if (textIdx == -1) {
            log.warn("No 'text' field found in Gemini response: {}", jsonResponse);
            return "Unable to parse AI response.";
        }

        int colonIdx = jsonResponse.indexOf(":", textIdx);
        int quoteStart = jsonResponse.indexOf("\"", colonIdx + 1);
        if (quoteStart == -1) return "Unable to parse AI response.";

        // Find the end quote, handling escaped quotes
        StringBuilder result = new StringBuilder();
        int i = quoteStart + 1;
        while (i < jsonResponse.length()) {
            char c = jsonResponse.charAt(i);
            if (c == '\\' && i + 1 < jsonResponse.length()) {
                char next = jsonResponse.charAt(i + 1);
                if (next == '"') { result.append('"'); i += 2; }
                else if (next == 'n') { result.append('\n'); i += 2; }
                else if (next == '\\') { result.append('\\'); i += 2; }
                else if (next == 't') { result.append('\t'); i += 2; }
                else { result.append(c); i++; }
            } else if (c == '"') {
                break;
            } else {
                result.append(c);
                i++;
            }
        }

        return result.toString().trim();
    }
}
