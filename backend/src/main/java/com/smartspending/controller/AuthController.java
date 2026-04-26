package com.smartspending.controller;

import com.smartspending.dto.AuthRequest;
import com.smartspending.dto.AuthResponse;
import com.smartspending.entity.User;
import com.smartspending.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User userRequest) {
        try {
            return ResponseEntity.ok(authService.register(userRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            return ResponseEntity.ok(authService.login(authRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid credentials"));
        }
    }
}
