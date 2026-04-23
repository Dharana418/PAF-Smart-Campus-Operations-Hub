package com.smartcampus.booking.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalTime;

public class BookingRequestDTO {
    @NotNull(message = "userId is required")
    @Positive(message = "userId must be positive")
    public Long userId;

    @NotNull(message = "resourceId is required")
    @Positive(message = "resourceId must be positive")
    public Long resourceId;

    @NotNull(message = "date is required")
    @FutureOrPresent(message = "date must be today or a future date")
    public LocalDate date;

    @NotNull(message = "startTime is required")
    public LocalTime startTime;

    @NotNull(message = "endTime is required")
    public LocalTime endTime;

    @NotBlank(message = "purpose is required")
    public String purpose;

    @NotNull(message = "attendees is required")
    @Min(value = 1, message = "attendees must be at least 1")
    public Integer attendees;

    @AssertTrue(message = "startTime must be before endTime")
    public boolean isTimeRangeValid() {
        if (startTime == null || endTime == null) {
            return true;
        }
        return startTime.isBefore(endTime);
    }
}
