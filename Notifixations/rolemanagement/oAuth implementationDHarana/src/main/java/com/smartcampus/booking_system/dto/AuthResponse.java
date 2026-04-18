package com.smartcampus.booking_system.dto;

public record AuthResponse(String token, UserProfileDto user) {
}
