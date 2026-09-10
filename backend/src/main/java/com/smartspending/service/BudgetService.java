package com.smartspending.service;

import com.smartspending.entity.Budget;
import com.smartspending.entity.User;
import com.smartspending.repository.BudgetRepository;
import com.smartspending.repository.ExpenseRepository;
import com.smartspending.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Map<String, Object>> getBudgetsWithSpending(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        List<Object[]> categorySpending = expenseRepository.findSumAmountByCategoryForUserAndDateRange(
                userId, startOfMonth, endOfMonth);

        Map<String, BigDecimal> spendingMap = new HashMap<>();
        for (Object[] row : categorySpending) {
            spendingMap.put((String) row[0], (BigDecimal) row[1]);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Budget budget : budgets) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", budget.getId());
            item.put("category", budget.getCategory());
            item.put("monthlyLimit", budget.getMonthlyLimit());
            item.put("spent", spendingMap.getOrDefault(budget.getCategory(), BigDecimal.ZERO));
            result.add(item);
        }
        return result;
    }

    public Budget setOrUpdateBudget(@org.springframework.lang.NonNull Long userId, String category, BigDecimal monthlyLimit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = budgetRepository.findByUserIdAndCategory(userId, category)
                .orElse(new Budget());
        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonthlyLimit(monthlyLimit);
        return budgetRepository.save(budget);
    }

    public void deleteBudget(@org.springframework.lang.NonNull Long budgetId, @org.springframework.lang.NonNull Long userId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        budgetRepository.delete(budget);
    }
}
