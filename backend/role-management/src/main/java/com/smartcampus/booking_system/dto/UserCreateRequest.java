package com.smartcampus.booking_system.dto;

import com.smartcampus.booking_system.model.RoleType;

public record UserCreateRequest(
    String fullName,
    String email,
    RoleType role,
    String birthday,
    String assignedDate
) {}
