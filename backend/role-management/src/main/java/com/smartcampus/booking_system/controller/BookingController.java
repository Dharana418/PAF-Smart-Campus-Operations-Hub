package com.smartcampus.booking_system.controller;

import com.smartcampus.booking_system.model.Booking;
import com.smartcampus.booking_system.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/my")
    public List<Booking> getMyBookings(Authentication auth) {
        return bookingService.getBookingsByUser(auth.getName());
    }

    @PostMapping
    public ResponseEntity<?> requestBooking(@RequestBody Booking booking, Authentication auth) {
        try {
            booking.setUserEmail(auth.getName());
            return ResponseEntity.ok(bookingService.requestBooking(booking));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            String reason = payload.get("reason");
            return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, reason));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id, Authentication auth) {
        try {
            bookingService.cancelBooking(id, auth.getName());
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
