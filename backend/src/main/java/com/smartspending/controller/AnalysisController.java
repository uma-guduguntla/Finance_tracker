package com.smartspending.controller;

import com.smartspending.entity.LeakExplanation;
import com.smartspending.entity.User;
import com.smartspending.repository.UserRepository;
import com.smartspending.service.AiAdvisorService;
import com.smartspending.service.AnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private AiAdvisorService aiAdvisorService;

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

    @GetMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshAnalysis(Authentication auth) {
        Long userId = getUserId(auth);
        analysisService.analyzeSpending(userId);
        return ResponseEntity.ok(Map.of("status", "Analysis refreshed successfully"));
    }

    @GetMapping("/ai-advice")
    public ResponseEntity<Map<String, String>> getAiAdvice(Authentication auth) {
        Long userId = getUserId(auth);
        String advice = aiAdvisorService.getFinancialAdvice(userId);
        return ResponseEntity.ok(Map.of("advice", advice));
    }

    @PostMapping("/ai-leak-advice")
    public ResponseEntity<Map<String, String>> getLeakAdvice(
            Authentication auth,
            @RequestBody Map<String, String> request) {
        Long userId = getUserId(auth);
        String type = request.getOrDefault("type", "");
        String description = request.getOrDefault("description", "");
        String advice = aiAdvisorService.getLeakAdvice(userId, type, description);
        return ResponseEntity.ok(Map.of("advice", advice));
    }
}
