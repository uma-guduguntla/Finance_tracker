package com.smartspending.controller;

import com.smartspending.entity.User;
import com.smartspending.repository.UserRepository;
import com.smartspending.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getBudgets(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(budgetService.getBudgetsWithSpending(userId));
    }

    @PostMapping
    public ResponseEntity<?> setBudget(@RequestBody Map<String, Object> request, Authentication auth) {
        try {
            Long userId = getUserId(auth);
            String category = (String) request.get("category");
            BigDecimal limit = new BigDecimal(request.get("monthlyLimit").toString());
            return ResponseEntity.ok(budgetService.setOrUpdateBudget(userId, category, limit));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, Authentication auth) {
        try {
            Long userId = getUserId(auth);
            budgetService.deleteBudget(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
