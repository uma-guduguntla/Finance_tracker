package com.smartspending.controller;

import com.smartspending.entity.LeakExplanation;
import com.smartspending.entity.User;
import com.smartspending.repository.UserRepository;
import com.smartspending.service.AnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping("/leaks")
    public ResponseEntity<List<LeakExplanation>> getLeaks(Authentication auth) {
        return ResponseEntity.ok(analysisService.getLeaks(getUserId(auth)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData(Authentication auth) {
        // Here we could aggregate dashboard data if needed, or frontend can fetch expenses and sum it up.
        // For simplicity, we just return a success payload or let frontend aggregate.
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Dashboard data can be aggregated by fetching expenses and leaks separately.");
        return ResponseEntity.ok(data);
    }
}
