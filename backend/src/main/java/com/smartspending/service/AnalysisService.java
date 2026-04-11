package com.smartspending.service;

import com.smartspending.entity.Expense;
import com.smartspending.entity.LeakExplanation;
import com.smartspending.entity.User;
import com.smartspending.repository.ExpenseRepository;
import com.smartspending.repository.LeakExplanationRepository;
import com.smartspending.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalysisService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private LeakExplanationRepository leakExplanationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void analyzeSpending(Long userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);

        // Clear previous explanations
        leakExplanationRepository.deleteByUserId(userId);

        if (expenses.isEmpty()) return;

        detectFrequentSmallTransactions(user, expenses);
        detectCategoryOverspending(user, expenses);
        detectSpendingVelocity(user, expenses);
        detectWeekendSpending(user, expenses);
        detectRecurringExpenses(user, expenses);
        detectDailySpikes(user, expenses);
    }

    // Rule 1: Frequent small transactions that add up
    private void detectFrequentSmallTransactions(User user, List<Expense> expenses) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Expense> recentSmall = expenses.stream()
                .filter(e -> e.getDate().isAfter(thirtyDaysAgo))
                .filter(e -> e.getAmount().compareTo(new BigDecimal("20")) < 0)
                .collect(Collectors.toList());

        if (recentSmall.size() > 5) {
            BigDecimal totalSmall = recentSmall.stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            saveLeak(user, "FREQUENT_SMALL_TRANSACTIONS",
                    "You made " + recentSmall.size() + " small transactions (under $20) in the last 30 days, " +
                    "totaling $" + totalSmall.setScale(2, RoundingMode.HALF_UP) +
                    ". These small purchases often go unnoticed but add up quickly.");
        }
    }

    // Rule 2: Any category exceeding a threshold
    private void detectCategoryOverspending(User user, List<Expense> expenses) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        Map<String, BigDecimal> categoryTotals = expenses.stream()
                .filter(e -> e.getDate().isAfter(thirtyDaysAgo))
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));

        BigDecimal totalSpent = categoryTotals.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (Map.Entry<String, BigDecimal> entry : categoryTotals.entrySet()) {
            if (totalSpent.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percentage = entry.getValue()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(totalSpent, 1, RoundingMode.HALF_UP);
                if (percentage.compareTo(BigDecimal.valueOf(60)) > 0) {
                    saveLeak(user, "CATEGORY_DOMINANCE",
                            entry.getKey() + " accounts for " + percentage + "% of your spending ($" +
                            entry.getValue().setScale(2, RoundingMode.HALF_UP) + " out of $" +
                            totalSpent.setScale(2, RoundingMode.HALF_UP) +
                            "). Consider setting a budget limit for this category.");
                }
            }
        }
    }

    // Rule 3: Spending velocity - current month vs last month
    private void detectSpendingVelocity(User user, List<Expense> expenses) {
        LocalDate now = LocalDate.now();
        int dayOfMonth = now.getDayOfMonth();
        LocalDate firstOfMonth = now.withDayOfMonth(1);
        LocalDate firstOfLastMonth = firstOfMonth.minusMonths(1);

        BigDecimal thisMonthSoFar = expenses.stream()
                .filter(e -> !e.getDate().isBefore(firstOfMonth))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal lastMonthSamePoint = expenses.stream()
                .filter(e -> !e.getDate().isBefore(firstOfLastMonth) && e.getDate().isBefore(firstOfLastMonth.plusDays(dayOfMonth)))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (lastMonthSamePoint.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal increase = thisMonthSoFar.subtract(lastMonthSamePoint)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(lastMonthSamePoint, 1, RoundingMode.HALF_UP);
            if (increase.compareTo(BigDecimal.valueOf(30)) > 0) {
                saveLeak(user, "SPENDING_VELOCITY",
                        "You've spent $" + thisMonthSoFar.setScale(2, RoundingMode.HALF_UP) +
                        " so far this month — that's " + increase + "% more than the same point last month ($" +
                        lastMonthSamePoint.setScale(2, RoundingMode.HALF_UP) +
                        "). Your spending pace is accelerating.");
            }
        }
    }

    // Rule 4: Weekend spending patterns
    private void detectWeekendSpending(User user, List<Expense> expenses) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Expense> recent = expenses.stream()
                .filter(e -> e.getDate().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());

        BigDecimal weekendTotal = BigDecimal.ZERO;
        BigDecimal weekdayTotal = BigDecimal.ZERO;
        int weekendDays = 0, weekdayDays = 0;

        for (Expense e : recent) {
            DayOfWeek dow = e.getDate().getDayOfWeek();
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
                weekendTotal = weekendTotal.add(e.getAmount());
                weekendDays++;
            } else {
                weekdayTotal = weekdayTotal.add(e.getAmount());
                weekdayDays++;
            }
        }

        if (weekendDays > 0 && weekdayDays > 0) {
            BigDecimal weekendAvg = weekendTotal.divide(BigDecimal.valueOf(weekendDays), 2, RoundingMode.HALF_UP);
            BigDecimal weekdayAvg = weekdayTotal.divide(BigDecimal.valueOf(weekdayDays), 2, RoundingMode.HALF_UP);

            if (weekdayAvg.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal ratio = weekendAvg.divide(weekdayAvg, 2, RoundingMode.HALF_UP);
                if (ratio.compareTo(BigDecimal.valueOf(2)) > 0) {
                    saveLeak(user, "WEEKEND_OVERSPEND",
                            "Your weekend spending averages $" + weekendAvg + " per transaction vs $" +
                            weekdayAvg + " on weekdays — that's " + ratio + "x more. " +
                            "Weekend impulse purchases may be a money leak.");
                }
            }
        }
    }

    // Rule 5: Recurring similar expenses (possible subscriptions or habits)
    private void detectRecurringExpenses(User user, List<Expense> expenses) {
        Map<String, List<Expense>> byDescription = expenses.stream()
                .collect(Collectors.groupingBy(e -> e.getDescription().toLowerCase().trim()));

        for (Map.Entry<String, List<Expense>> entry : byDescription.entrySet()) {
            List<Expense> group = entry.getValue();
            if (group.size() >= 3) {
                BigDecimal total = group.stream()
                        .map(Expense::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                saveLeak(user, "RECURRING_EXPENSE",
                        "\"" + group.get(0).getDescription() + "\" appears " + group.size() +
                        " times totaling $" + total.setScale(2, RoundingMode.HALF_UP) +
                        ". This looks like a recurring expense — check if it's necessary.");
            }
        }
    }

    // Rule 6: Daily spending spikes
    private void detectDailySpikes(User user, List<Expense> expenses) {
        LocalDate fourteenDaysAgo = LocalDate.now().minusDays(14);
        Map<LocalDate, BigDecimal> dailyTotals = expenses.stream()
                .filter(e -> e.getDate().isAfter(fourteenDaysAgo))
                .collect(Collectors.groupingBy(
                        Expense::getDate,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));

        if (dailyTotals.size() < 3) return;

        BigDecimal avg = dailyTotals.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(dailyTotals.size()), 2, RoundingMode.HALF_UP);

        BigDecimal spikeThreshold = avg.multiply(BigDecimal.valueOf(3));
        for (Map.Entry<LocalDate, BigDecimal> entry : dailyTotals.entrySet()) {
            if (entry.getValue().compareTo(spikeThreshold) > 0) {
                saveLeak(user, "DAILY_SPIKE",
                        "On " + entry.getKey() + " you spent $" + entry.getValue().setScale(2, RoundingMode.HALF_UP) +
                        " — that's over 3x your daily average of $" + avg +
                        ". Check for any unnecessary large purchases.");
                break; // only report the most recent spike
            }
        }
    }

    private void saveLeak(User user, String type, String explanation) {
        LeakExplanation leak = new LeakExplanation();
        leak.setUser(user);
        leak.setType(type);
        leak.setExplanation(explanation);
        leak.setDetectedAt(LocalDateTime.now());
        leakExplanationRepository.save(leak);
    }

    public List<LeakExplanation> getLeaks(Long userId) {
        return leakExplanationRepository.findByUserIdOrderByDetectedAtDesc(userId);
    }
}
