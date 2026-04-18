package com.smartcampus.booking_system.dto;

import lombok.Builder;

@Builder
public record AuthResponse(String token, UserProfileDto user) {
}
