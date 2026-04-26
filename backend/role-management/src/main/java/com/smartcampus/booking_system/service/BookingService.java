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
    private static final int MAX_PURPOSE_LENGTH = 300;
    private static final int MAX_EXPECTED_ATTENDEES = 1000;
    private static final long MAX_BOOKING_HOURS = 12;

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
        if (booking == null) {
            throw new IllegalArgumentException("Booking payload is required");
        }

        if (booking.getResourceId() == null || booking.getResourceId().isBlank()) {
            throw new IllegalArgumentException("Resource is required");
        }

        if (booking.getUserEmail() == null || booking.getUserEmail().isBlank()) {
            throw new IllegalArgumentException("User email is required");
        }

        validatePurpose(booking.getPurpose());
        validateExpectedAttendees(booking.getExpectedAttendees());

        validateBookingTimeRange(booking.getStartTime(), booking.getEndTime());

        if (hasConflictingBooking(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), null, Arrays.asList("PENDING", "APPROVED"))) {
            throw new IllegalArgumentException("Conflict detected: The resource is already booked for this time range.");
        }

        booking.setStatus("PENDING");
        booking.setPurpose(booking.getPurpose().trim());
        booking.setResourceId(booking.getResourceId().trim());
        booking.setUserEmail(booking.getUserEmail().trim().toLowerCase(Locale.ROOT));
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

        if ("CANCELLED".equals(normalizeStatus(booking.getStatus()))) {
            throw new IllegalArgumentException("Cancelled bookings cannot be updated");
        }

        if ("REJECTED".equals(normalizeStatus(booking.getStatus())) && "APPROVED".equals(normalizedStatus)) {
            throw new IllegalArgumentException("Rejected bookings cannot be approved");
        }

        if ("REJECTED".equals(normalizedStatus)) {
            if (reason == null || reason.trim().length() < 3) {
                throw new IllegalArgumentException("A rejection reason with at least 3 characters is required");
            }
        }

        if ("APPROVED".equals(normalizedStatus)) {
            validateBookingTimeRange(booking.getStartTime(), booking.getEndTime());
            if (hasConflictingBooking(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), booking.getId(), List.of("APPROVED"))) {
                throw new IllegalArgumentException("Conflict detected: This resource already has an approved booking for the selected time range.");
            }
        }

        booking.setStatus(normalizedStatus);
        booking.setRejectionReason(reason == null || reason.trim().isEmpty() ? null : reason.trim());
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
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Booking id is required");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        String bookingOwnerEmail = booking.getUserEmail();
        if (bookingOwnerEmail == null || bookingOwnerEmail.isBlank()) {
            throw new IllegalArgumentException("Booking owner information is missing");
        }
        
        if (userEmail == null || userEmail.isBlank() || !bookingOwnerEmail.equalsIgnoreCase(userEmail)) {
            throw new IllegalArgumentException("Unauthorized to cancel this booking");
        }

        String normalizedStatus = normalizeStatus(booking.getStatus());
        if (!("PENDING".equals(normalizedStatus) || "APPROVED".equals(normalizedStatus))) {
            throw new IllegalArgumentException("Only pending or approved bookings can be cancelled");
        }

        if (booking.getEndTime() != null && booking.getEndTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Past bookings cannot be cancelled");
        }

        booking.setStatus("CANCELLED");
        booking.setRejectionReason(null);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    public void deleteBooking(String id, String requesterEmail, boolean isAdmin) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Booking id is required");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        String bookingOwnerEmail = booking.getUserEmail();

        if (!isAdmin) {
            if (bookingOwnerEmail == null || bookingOwnerEmail.isBlank()) {
                throw new IllegalArgumentException("Booking owner information is missing");
            }

            if (requesterEmail == null || requesterEmail.isBlank() || !bookingOwnerEmail.equalsIgnoreCase(requesterEmail)) {
                throw new IllegalArgumentException("Unauthorized to delete this booking");
            }

            String normalizedStatus = normalizeStatus(booking.getStatus());
            if (!("CANCELLED".equals(normalizedStatus) || "REJECTED".equals(normalizedStatus))) {
                throw new IllegalArgumentException("Only cancelled or rejected bookings can be deleted");
            }
        }

        bookingRepository.deleteById(id);
    }

    private void validateBookingTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start time must be in the future");
        }

        long bookingHours = java.time.Duration.between(startTime, endTime).toHours();
        if (bookingHours > MAX_BOOKING_HOURS) {
            throw new IllegalArgumentException("Booking duration cannot exceed " + MAX_BOOKING_HOURS + " hours");
        }
    }

    private void validatePurpose(String purpose) {
        if (purpose == null || purpose.trim().isEmpty()) {
            throw new IllegalArgumentException("Purpose is required");
        }
        if (purpose.trim().length() > MAX_PURPOSE_LENGTH) {
            throw new IllegalArgumentException("Purpose cannot exceed " + MAX_PURPOSE_LENGTH + " characters");
        }
    }

    private void validateExpectedAttendees(Integer expectedAttendees) {
        if (expectedAttendees == null) {
            throw new IllegalArgumentException("Expected attendees is required");
        }
        if (expectedAttendees < 1) {
            throw new IllegalArgumentException("Expected attendees must be at least 1");
        }
        if (expectedAttendees > MAX_EXPECTED_ATTENDEES) {
            throw new IllegalArgumentException("Expected attendees cannot exceed " + MAX_EXPECTED_ATTENDEES);
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
