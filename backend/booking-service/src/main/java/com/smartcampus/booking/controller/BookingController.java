package com.smartcampus.booking.controller;
import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingResponseDTO;
import com.smartcampus.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor

public class BookingController {
     private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getBookings(
        @RequestHeader("role") String role,
        @RequestHeader(value = "userId", required = false) Long userId
    ) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(bookingService.getBookings(null, role, userId));
        }

        if (userId == null) {
            throw new RuntimeException("userId header is required for USER role");
        }

        return ResponseEntity.ok(bookingService.getBookings(userId, role, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(
        @PathVariable Long id,
        @RequestHeader("role") String role,
        @RequestHeader(value = "userId", required = false) Long requesterUserId
    ) {
        return ResponseEntity.ok(bookingService.getBookingById(id, role, requesterUserId));
    }

    // 🔹 Create Booking
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
        @Valid @RequestBody BookingRequestDTO dto,
        @RequestHeader("role") String role,
        @RequestHeader("userId") Long userId
    ) {

        BookingResponseDTO response = bookingService.createBooking(dto, role, userId);
        return ResponseEntity.ok(response);
}

    // 🔹 Approve Booking (with conflict detection)
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingResponseDTO> approveBooking(@PathVariable Long id,
         @RequestHeader("role") String role
    ) {
        BookingResponseDTO approved = bookingService.approveBooking(id, role);
        return ResponseEntity.ok(approved);
    }

    //reject booking
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
        @PathVariable Long id,
        @RequestParam String reason,
        @RequestHeader("role") String role
    ) {
    BookingResponseDTO rejected = bookingService.rejectBooking(id, reason, role);
    return ResponseEntity.ok(rejected);
}
    //cancel booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id,
        @RequestHeader("role") String role,
        @RequestHeader("userId") Long userId
    ) {
    BookingResponseDTO cancelled = bookingService.cancelBooking(id, role, userId);
    return ResponseEntity.ok(cancelled);
}
}
