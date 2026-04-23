package com.smartcampus.booking_system.controller;

import com.smartcampus.booking_system.dto.RoleUpdateRequest;
import com.smartcampus.booking_system.dto.UserCreateRequest;
import com.smartcampus.booking_system.dto.UserProfileDto;
import com.smartcampus.booking_system.dto.UserProfileUpdateRequest;
import com.smartcampus.booking_system.service.UserAccountService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserAccountService userAccountService;

    public AdminController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileDto>> users() {
        return ResponseEntity.ok(userAccountService.getAllProfiles());
    }

    @PostMapping("/users")
    public ResponseEntity<UserProfileDto> createUser(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(userAccountService.createUser(
                request.fullName(),
                request.email(),
                request.role(),
                request.birthday(),
                request.assignedDate()
        ));
    }

    @PatchMapping("/users/{email}/role")
    public ResponseEntity<UserProfileDto> updateRole(
            @PathVariable String email,
            @Valid @RequestBody RoleUpdateRequest request
    ) {
        return ResponseEntity.ok(userAccountService.updateRole(email, request.role()));
    }

    @DeleteMapping("/users/{email}")
    public ResponseEntity<Void> deleteUser(@PathVariable String email) {
        userAccountService.deleteUser(email);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{email}")
    public ResponseEntity<UserProfileDto> updateProfile(
            @PathVariable String email,
            @RequestBody UserProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(userAccountService.updateProfile(
                email, 
                request.fullName(), 
                request.email(),
                request.birthday(), 
                request.assignedDate()
        ));
    }
}
