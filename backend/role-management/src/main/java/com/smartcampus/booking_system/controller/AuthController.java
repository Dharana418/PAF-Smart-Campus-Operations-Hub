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

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserAccountService userAccountService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserAccountService userAccountService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userAccountService = userAccountService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> me(Authentication authentication) {
        UserAccount user = userAccountService.getRequiredByEmail(authentication.getName());
        return ResponseEntity.ok(userAccountService.toProfile(user));
    }

    @PostMapping("/public/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return devLogin(req);
    }

    @PostMapping("/public/auth/dev-login")
    public ResponseEntity<LoginResponse> devLogin(@RequestBody LoginRequest req) {
        UserAccount user = userAccountService.getRequiredByEmail(req.getEmail());
        
        if (user.getPassword() != null && !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        } else if (user.getPassword() == null && req.getPassword() != null && !req.getPassword().isEmpty()) {
            // Option to handle users without password but attempt was made
            // Could throw, but keeping old behavior for backwards compatibility
            // if no password was set on the user.
            throw new BadCredentialsException("Invalid credentials");
        }
        
        String token = jwtService.generateToken(user.getEmail(), user.getFullName(), user.getRole());
        return ResponseEntity.ok(new LoginResponse(token));
    }
}
