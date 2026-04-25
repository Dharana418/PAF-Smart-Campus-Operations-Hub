package com.smartcampus.booking_system.service;

import com.smartcampus.booking_system.model.Booking;
import com.smartcampus.booking_system.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {
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
        // Conflict checking
        List<String> activeStatuses = Arrays.asList("PENDING", "APPROVED");
        List<Booking> conflicts = bookingRepository.findByResourceIdAndStatusInAndStartTimeBeforeAndEndTimeAfter(
                booking.getResourceId(), activeStatuses, booking.getEndTime(), booking.getStartTime());

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Conflict detected: The resource is already booked for this time range.");
        }

        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(String id, String status, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);
        if (reason != null) booking.setRejectionReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking saved = bookingRepository.save(booking);
        
        // Notify user
        notificationService.createNotification(
            "system@smartcampus.com",
            new com.smartcampus.booking_system.dto.CreateNotificationRequest(
                "Booking Status Updated",
                "Your booking for resource " + booking.getResourceId() + " has been " + status + (reason != null ? ". Reason: " + reason : "."),
                com.smartcampus.booking_system.model.NotificationType.valueOf(status.equals("APPROVED") ? "SUCCESS" : (status.equals("REJECTED") ? "CRITICAL" : "INFO")),
                booking.getUserEmail(),
                false
            )
        );
        
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
}
