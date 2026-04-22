package com.smartcampus.booking_system.controller;

import com.smartcampus.booking_system.dto.LoginRequest;
import com.smartcampus.booking_system.dto.LoginResponse;
import com.smartcampus.booking_system.dto.UserProfileDto;
import com.smartcampus.booking_system.model.UserAccount;
import com.smartcampus.booking_system.service.JwtService;
import com.smartcampus.booking_system.service.UserAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserAccountService userAccountService;
    private final JwtService jwtService;

    public AuthController(UserAccountService userAccountService, JwtService jwtService) {
        this.userAccountService = userAccountService;
        this.jwtService = jwtService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> me(Authentication authentication) {
        UserAccount user = userAccountService.getRequiredByEmail(authentication.getName());
        return ResponseEntity.ok(userAccountService.toProfile(user));
    }

    // Development-friendly email-only login: returns JWT for an existing user by email.
    // WARNING: This endpoint is intended for development/demo use only.
    @PostMapping("/public/auth/dev-login")
    public ResponseEntity<LoginResponse> devLogin(@RequestBody LoginRequest req) {
        UserAccount user = userAccountService.getRequiredByEmail(req.getEmail());
        String token = jwtService.generateToken(user.getEmail(), user.getFullName(), user.getRole());
        return ResponseEntity.ok(new LoginResponse(token));
    }
}


