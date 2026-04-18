package com.smartcampus.booking_system.dto;

import com.smartcampus.booking_system.model.NotificationType;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record NotificationDto(
        Long id,
        String title,
        String message,
        NotificationType type,
        boolean isRead,
        LocalDateTime createdAt
) {
}
