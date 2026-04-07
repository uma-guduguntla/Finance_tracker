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
import java.time.LocalDateTime;
import java.util.List;

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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);
        
        // Clear previous explanations
        leakExplanationRepository.deleteByUserId(userId);
        
        if (expenses.isEmpty()) return;

        detectFrequentSmallTransactions(user, expenses);
        detectCategoryOverspending(user, expenses);
    }

    private void detectFrequentSmallTransactions(User user, List<Expense> expenses) {
        long smallTxCount = expenses.stream()
                .filter(e -> e.getAmount().compareTo(new BigDecimal("50")) < 0)
                .count();

        if (smallTxCount > 10) {
            LeakExplanation leak = new LeakExplanation();
            leak.setUser(user);
            leak.setType("FREQUENT_SMALL_TRANSACTIONS");
            leak.setExplanation("You have many small transactions (< 50). These can add up quickly as 'money leaks'.");
            leak.setDetectedAt(LocalDateTime.now());
            leakExplanationRepository.save(leak);
        }
    }

    private void detectCategoryOverspending(User user, List<Expense> expenses) {
        // Simplified rule: if any category is over 500, flag it
        List<Object[]> categorySums = expenseRepository.findSumAmountByCategoryForUser(user.getId());
        
        for (Object[] catSum : categorySums) {
            String category = (String) catSum[0];
            BigDecimal total = (BigDecimal) catSum[1];
            
            if (total != null && total.compareTo(new BigDecimal("500")) > 0) {
                LeakExplanation leak = new LeakExplanation();
                leak.setUser(user);
                leak.setType("CATEGORY_OVERSPENDING");
                leak.setExplanation("You are spending heavily on " + category + " (Total: " + total + "). Consider budgeting this category.");
                leak.setDetectedAt(LocalDateTime.now());
                leakExplanationRepository.save(leak);
            }
        }
    }

    public List<LeakExplanation> getLeaks(Long userId) {
        return leakExplanationRepository.findByUserIdOrderByDetectedAtDesc(userId);
    }
}
