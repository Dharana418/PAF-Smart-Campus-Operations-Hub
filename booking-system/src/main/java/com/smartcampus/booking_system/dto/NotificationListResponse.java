package com.smartcampus.booking_system.dto;

import java.util.List;
import lombok.Builder;

@Builder
public record NotificationListResponse(List<NotificationDto> notifications, long unreadCount) {
}
