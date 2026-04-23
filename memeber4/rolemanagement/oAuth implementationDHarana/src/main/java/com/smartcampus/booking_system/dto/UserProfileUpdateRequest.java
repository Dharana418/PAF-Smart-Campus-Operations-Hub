package com.smartcampus.booking_system.dto;

public record UserProfileUpdateRequest(
    String fullName,
    String email,
    String birthday,
    String assignedDate
) {}
