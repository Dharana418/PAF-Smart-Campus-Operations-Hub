package com.smartcampus.booking.dto;

import com.smartcampus.booking.entity.BookingStatus;
import java.time.*;

public class BookingResponseDTO {
    public Long id;
    public Long userId;
    public Long resourceId;

    public LocalDate date;
    public LocalTime startTime;
    public LocalTime endTime;

    public String purpose;
    public Integer attendees;

    public BookingStatus status;
    public String adminReason;

    public LocalDateTime createdAt;
}
