package com.smartspending.service;

import com.smartspending.entity.Expense;
import com.smartspending.entity.User;
import com.smartspending.repository.ExpenseRepository;
import com.smartspending.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AnalysisService analysisService;

    public Expense addExpense(Long userId, Expense expense) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        expense.setUser(user);
        Expense saved = expenseRepository.save(expense);
        
        // Trigger async or sync analysis after adding an expense
        analysisService.analyzeSpending(userId);
        
        return saved;
    }

    public List<Expense> getExpensesByUser(Long userId) {
        return expenseRepository.findByUserIdOrderByDateDesc(userId);
    }

    public void deleteExpense(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        expenseRepository.deleteById(id);
        analysisService.analyzeSpending(userId);
    }

    public Expense updateExpense(Long id, Long userId, Expense expenseDetails) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        expense.setAmount(expenseDetails.getAmount());
        expense.setCategory(expenseDetails.getCategory());
        expense.setDescription(expenseDetails.getDescription());
        expense.setDate(expenseDetails.getDate());
        
        Expense updated = expenseRepository.save(expense);
        analysisService.analyzeSpending(userId);
        return updated;
    }
}
