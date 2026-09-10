package com.smartspending.controller;

import com.smartspending.entity.Utility;
import com.smartspending.entity.Utility.UtilityType;
import com.smartspending.entity.UtilityBudget;
import com.smartspending.entity.User;
import com.smartspending.repository.UserRepository;
import com.smartspending.service.UtilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilities")
@SuppressWarnings("null")
public class UtilityController {

    @Autowired
    private UtilityService utilityService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<Utility>> getAllUtilities(Authentication auth) {
        return ResponseEntity.ok(utilityService.getAllUtilities(getUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<?> addUtility(@RequestBody Utility utility, Authentication auth) {
        try {
            return ResponseEntity.ok(utilityService.addUtility(getUserId(auth), utility));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUtility(@PathVariable Long id, @RequestBody Utility utility, Authentication auth) {
        try {
            return ResponseEntity.ok(utilityService.updateUtility(id, getUserId(auth), utility));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUtility(@PathVariable Long id, Authentication auth) {
        try {
            utilityService.deleteUtility(id, getUserId(auth));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<?> markAsPaid(@PathVariable Long id, Authentication auth) {
        try {
            return ResponseEntity.ok(utilityService.markAsPaid(id, getUserId(auth)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(Authentication auth) {
        return ResponseEntity.ok(utilityService.getMonthlySummary(getUserId(auth)));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Utility>> getUpcoming(Authentication auth) {
        return ResponseEntity.ok(utilityService.getUpcomingDue(getUserId(auth)));
    }

    @PostMapping("/budget")
    public ResponseEntity<?> setBudget(@RequestBody Map<String, Object> request, Authentication auth) {
        try {
            Long userId = getUserId(auth);
            UtilityType type = UtilityType.valueOf((String) request.get("utilityType"));
            BigDecimal limit = new BigDecimal(request.get("monthlyLimit").toString());
            return ResponseEntity.ok(utilityService.setUtilityBudget(userId, type, limit));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/budget")
    public ResponseEntity<List<UtilityBudget>> getBudgets(Authentication auth) {
        return ResponseEntity.ok(utilityService.getUtilityBudgets(getUserId(auth)));
    }
}
