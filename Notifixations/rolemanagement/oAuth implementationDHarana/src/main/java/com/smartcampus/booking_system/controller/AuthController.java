package com.smartcampus.booking_system.controller;

import com.smartcampus.booking_system.dto.UserProfileDto;
import com.smartcampus.booking_system.model.UserAccount;
import com.smartcampus.booking_system.service.UserAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserAccountService userAccountService;

    public AuthController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> me(Authentication authentication) {
        UserAccount user = userAccountService.getRequiredByEmail(authentication.getName());
        return ResponseEntity.ok(userAccountService.toProfile(user));
    }
}
