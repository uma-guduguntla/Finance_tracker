package com.smartspending.controller;

import com.smartspending.entity.Expense;
import com.smartspending.entity.User;
import com.smartspending.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartspending.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private static final Logger log = LoggerFactory.getLogger(ExpenseController.class);

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<?> addExpense(@RequestBody Expense expense, Authentication auth) {
        try {
            Long userId = getUserId(auth);
            log.info("Adding expense for userId={}", userId);
            Expense saved = expenseService.addExpense(userId, expense);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error adding expense", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getExpenses(Authentication auth) {
        try {
            Long userId = getUserId(auth);
            log.info("Fetching expenses for userId={}", userId);
            List<Expense> expenses = expenseService.getExpensesByUser(userId);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            log.error("Error fetching expenses", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@PathVariable Long id, @RequestBody Expense expense, Authentication auth) {
        try {
            Long userId = getUserId(auth);
            log.info("Updating expense id={} for userId={}", id, userId);
            Expense updated = expenseService.updateExpense(id, userId, expense);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating expense id={}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id, Authentication auth) {
        try {
            Long userId = getUserId(auth);
            log.info("Deleting expense id={} for userId={}", id, userId);
            expenseService.deleteExpense(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting expense id={}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
