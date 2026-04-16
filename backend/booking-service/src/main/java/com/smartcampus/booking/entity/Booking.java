package com.smartcampus.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who made the booking
    private Long userId;

    // Resource (room/lab/equipment)
    private Long resourceId;

    private LocalDate date;

    private LocalTime startTime;
    private LocalTime endTime;

    private String purpose;

    private Integer attendees;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private String adminReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = BookingStatus.PENDING;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
