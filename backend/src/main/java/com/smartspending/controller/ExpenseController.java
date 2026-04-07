package com.smartspending.controller;

import com.smartspending.entity.Expense;
import com.smartspending.entity.User;
import com.smartspending.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartspending.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;
    
    @Autowired
    private UserRepository userRepository;

    private Long getUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense, Authentication auth) {
        return ResponseEntity.ok(expenseService.addExpense(getUserId(auth), expense));
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(Authentication auth) {
        return ResponseEntity.ok(expenseService.getExpensesByUser(getUserId(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense, Authentication auth) {
        return ResponseEntity.ok(expenseService.updateExpense(id, getUserId(auth), expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id, Authentication auth) {
        expenseService.deleteExpense(id, getUserId(auth));
        return ResponseEntity.ok().build();
    }
}
