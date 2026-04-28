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
import java.util.Map;

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
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    try {
        UserAccount user = userAccountService.getRequiredByEmail(req.getEmail());

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(
            user.getEmail(),
            user.getFullName(),
            user.getRole()
        );

        return ResponseEntity.ok(new LoginResponse(token));

    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
    } catch (BadCredentialsException e) {
        return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
    }
}
    @PostMapping("/public/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest req) {
        try {
            UserAccount user = userAccountService.getRequiredByEmail(req.getEmail());

            if (user.getRole() == null || !"ROLE_ADMIN".equals(user.getRole().name())) {
                throw new BadCredentialsException("Not an admin account");
            }

            if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
                throw new BadCredentialsException("Invalid credentials");
            }

            String token = jwtService.generateToken(
                user.getEmail(),
                user.getFullName(),
                user.getRole()
            );

            return ResponseEntity.ok(new LoginResponse(token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }
}
