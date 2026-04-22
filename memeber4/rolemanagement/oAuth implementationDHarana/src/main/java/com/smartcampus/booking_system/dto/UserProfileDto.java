package com.smartcampus.booking_system.dto;

import com.smartcampus.booking_system.model.RoleType;

public record UserProfileDto(String id, String fullName, String email, RoleType role) {
}
