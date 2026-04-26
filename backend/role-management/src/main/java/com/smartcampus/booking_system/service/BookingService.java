package com.smartcampus.booking_system.service;

import com.smartcampus.booking_system.model.Booking;
import com.smartcampus.booking_system.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class BookingService {
    private static final Logger LOGGER = LoggerFactory.getLogger(BookingService.class);
    private static final Set<String> ALLOWED_STATUSES = Set.of("PENDING", "APPROVED", "REJECTED", "CANCELLED");

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository, NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUser(String email) {
        return bookingRepository.findByUserEmail(email);
    }

    public Booking requestBooking(Booking booking) {
        if (booking.getResourceId() == null || booking.getResourceId().isBlank()) {
            throw new IllegalArgumentException("Resource is required");
        }

        validateBookingTimeRange(booking.getStartTime(), booking.getEndTime());

        if (hasConflictingBooking(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), null, Arrays.asList("PENDING", "APPROVED"))) {
            throw new IllegalArgumentException("Conflict detected: The resource is already booked for this time range.");
        }

        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(String id, String status, String reason) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new IllegalArgumentException("Invalid booking status: " + status);
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        if ("APPROVED".equals(normalizedStatus)) {
            validateBookingTimeRange(booking.getStartTime(), booking.getEndTime());
            if (hasConflictingBooking(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), booking.getId(), List.of("APPROVED"))) {
                throw new IllegalArgumentException("Conflict detected: This resource already has an approved booking for the selected time range.");
            }
        }

        booking.setStatus(normalizedStatus);
        if (reason != null) {
            booking.setRejectionReason(reason.trim().isEmpty() ? null : reason.trim());
        }
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking saved = bookingRepository.save(booking);
        
        // Notification delivery should not block status updates.
        try {
            notificationService.createNotification(
                booking.getUserEmail(),
                new com.smartcampus.booking_system.dto.CreateNotificationRequest(
                    "Booking Status Updated",
                    "Your booking for resource " + booking.getResourceId() + " has been " + normalizedStatus + (reason != null && !reason.isBlank() ? ". Reason: " + reason.trim() : "."),
                    com.smartcampus.booking_system.model.NotificationType.valueOf(normalizedStatus.equals("APPROVED") ? "SUCCESS" : (normalizedStatus.equals("REJECTED") ? "CRITICAL" : "INFO")),
                    booking.getUserEmail(),
                    false
                )
            );
        } catch (RuntimeException ex) {
            LOGGER.warn("Booking status updated but notification failed for booking {}: {}", id, ex.getMessage());
        }
        
        return saved;
    }

    public void cancelBooking(String id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        booking.setStatus("CANCELLED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    private void validateBookingTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private boolean hasConflictingBooking(
            String resourceId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            String excludeBookingId,
            List<String> statuses
    ) {
        Set<String> normalizedStatuses = new HashSet<>();
        for (String status : statuses) {
            normalizedStatuses.add(normalizeStatus(status));
        }

        return bookingRepository.findByResourceId(resourceId).stream()
                .filter(existing -> excludeBookingId == null || !excludeBookingId.equals(existing.getId()))
                .filter(existing -> normalizedStatuses.contains(normalizeStatus(existing.getStatus())))
                .anyMatch(existing -> isOverlapping(startTime, endTime, existing.getStartTime(), existing.getEndTime()));
    }

    private boolean isOverlapping(
            LocalDateTime newStart,
            LocalDateTime newEnd,
            LocalDateTime existingStart,
            LocalDateTime existingEnd
    ) {
        if (existingStart == null || existingEnd == null) {
            return false;
        }
        return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
    }

    private String normalizeStatus(String status) {
        if (status == null) {
            return "";
        }
        return status.trim().toUpperCase(Locale.ROOT);
    }
}
