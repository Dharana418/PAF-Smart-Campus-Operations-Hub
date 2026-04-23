package com.smartcampus.booking_system.dto;

import com.smartcampus.booking_system.model.NotificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateNotificationRequest(
        @NotBlank String title,
        @NotBlank String message,
        @NotNull NotificationType type,
        String recipientEmail,
        boolean isBroadcast
) {
}
