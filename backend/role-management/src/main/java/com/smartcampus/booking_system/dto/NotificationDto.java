package com.smartcampus.booking_system.dto;

import com.smartcampus.booking_system.model.NotificationType;
import java.time.LocalDateTime;

public record NotificationDto(
        String id,
        String title,
        String message,
        NotificationType type,
        boolean isRead,
        LocalDateTime createdAt
) {
}
