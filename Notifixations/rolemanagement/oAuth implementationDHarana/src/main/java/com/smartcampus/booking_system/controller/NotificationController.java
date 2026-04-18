package com.smartcampus.booking_system.controller;

import com.smartcampus.booking_system.dto.CreateNotificationRequest;
import com.smartcampus.booking_system.dto.NotificationDto;
import com.smartcampus.booking_system.dto.NotificationListResponse;
import com.smartcampus.booking_system.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<NotificationListResponse> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getForUser(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<NotificationDto> createNotification(@Valid @RequestBody CreateNotificationRequest request) {
        return ResponseEntity.ok(notificationService.createNotification(request));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDto> markRead(
            Authentication authentication,
            @PathVariable Long notificationId,
            @RequestParam(defaultValue = "true") boolean read
    ) {
        return ResponseEntity.ok(notificationService.markRead(authentication.getName(), notificationId, read));
    }
}
