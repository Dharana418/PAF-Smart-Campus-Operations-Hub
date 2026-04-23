package com.smartcampus.booking_system.controller;

import com.smartcampus.booking_system.dto.CreateNotificationRequest;
import com.smartcampus.booking_system.dto.NotificationDto;
import com.smartcampus.booking_system.dto.NotificationListResponse;
import com.smartcampus.booking_system.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @GetMapping("/sent")
    public ResponseEntity<java.util.List<NotificationDto>> getSentNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getSentBy(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<NotificationDto> createNotification(Authentication authentication, @Valid @RequestBody CreateNotificationRequest request) {
        return ResponseEntity.ok(notificationService.createNotification(authentication.getName(), request));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDto> markRead(
            Authentication authentication,
            @PathVariable String notificationId,
            @RequestParam(defaultValue = "true") boolean read
    ) {
        return ResponseEntity.ok(notificationService.markRead(authentication.getName(), notificationId, read));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationDto> updateNotification(Authentication authentication, @PathVariable String id, @Valid @RequestBody CreateNotificationRequest request) {
        return ResponseEntity.ok(notificationService.updateNotification(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(Authentication authentication, @PathVariable String id) {
        notificationService.deleteNotification(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
