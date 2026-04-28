package com.smartcampus.booking_system.dto;

import com.smartcampus.booking_system.model.RoleType;

import java.time.LocalDate;

public record UserProfileDto(String id, String fullName, String email, RoleType role, LocalDate birthday, LocalDate assignedDate) {
}
