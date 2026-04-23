package com.smartcampus.booking_system.dto;

import com.smartcampus.booking_system.model.RoleType;
import jakarta.validation.constraints.NotNull;

public record RoleUpdateRequest(@NotNull RoleType role) {
}
