package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingResponseDTO;
import com.smartcampus.booking.entity.*;
import com.smartcampus.booking.execption.BookingConflictException;
import com.smartcampus.booking.execption.BookingNotFoundException;
import com.smartcampus.booking.execption.InvalidBookingStateException;
import com.smartcampus.booking.execption.SecurityViolationException;
import com.smartcampus.booking.mapper.BookingMapper;
import com.smartcampus.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_USER = "USER";
    private static final int MAX_REJECTION_REASON_LENGTH = 500;

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    public BookingResponseDTO getBookingById(Long bookingId, String requesterRole, Long requesterUserId) {
        Booking booking = getBookingOrThrow(bookingId);
        ensureCanAccessBooking(booking, parseRole(requesterRole), requesterUserId);
        return bookingMapper.toResponseDTO(booking);
    }

    public List<BookingResponseDTO> getBookings(Long userId, String requesterRole, Long requesterUserId) {
        String callerRole = parseRole(requesterRole);
        List<Booking> bookings;

        if (ROLE_ADMIN.equals(callerRole)) {
            bookings = (userId != null)
                    ? bookingRepository.findByUserId(userId)
                    : bookingRepository.findAll();
        } else {
            validateRequesterUserId(requesterUserId);
            if (userId != null && !Objects.equals(userId, requesterUserId)) {
                throw new SecurityViolationException("Users can only access their own bookings");
            }
            bookings = bookingRepository.findByUserId(requesterUserId);
        }

        return bookingMapper.toResponseDTOList(bookings);
    }

    public BookingResponseDTO approveBooking(Long bookingId, String requesterRole) {
        ensureAdmin(requesterRole);
        Booking booking = getBookingOrThrow(bookingId);

        ensureStatus(booking, BookingStatus.PENDING, "Only PENDING bookings can be approved");

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
            booking.getEndTime(),
            BookingStatus.APPROVED
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Booking conflict detected");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return saveAndMap(booking);
    }

    public BookingResponseDTO createBooking(BookingRequestDTO dto, String requesterRole, Long requesterUserId) {
        ensureUser(requesterRole);
        validateRequesterUserId(requesterUserId);
        if (!Objects.equals(dto.userId, requesterUserId)) {
            throw new SecurityViolationException("Users can only create bookings for themselves");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                dto.resourceId,
                dto.date,
                dto.startTime,
                dto.endTime,
                BookingStatus.APPROVED
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Booking conflict detected");
        }

        Booking booking = bookingMapper.toEntity(dto);
        booking.setStatus(BookingStatus.PENDING);
        return saveAndMap(booking);
    }

    public BookingResponseDTO rejectBooking(Long bookingId, String reason, String requesterRole) {
        ensureAdmin(requesterRole);
        Booking booking = getBookingOrThrow(bookingId);
        ensureStatus(booking, BookingStatus.PENDING, "Only PENDING bookings can be rejected");
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(sanitizeReason(reason));
        return saveAndMap(booking);
    }

    public BookingResponseDTO cancelBooking(Long bookingId, String requesterRole, Long requesterUserId) {
        ensureUser(requesterRole);
        validateRequesterUserId(requesterUserId);

        Booking booking = getBookingOrThrow(bookingId);
        if (!Objects.equals(booking.getUserId(), requesterUserId)) {
            throw new SecurityViolationException("Users can only cancel their own bookings");
        }

        ensureStatus(booking, BookingStatus.APPROVED, "Only APPROVED bookings can be cancelled");
        booking.setStatus(BookingStatus.CANCELLED);
        return saveAndMap(booking);
    }

    private Booking getBookingOrThrow(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));
    }

    private void ensureStatus(Booking booking, BookingStatus expected, String message) {
        if (booking.getStatus() != expected) {
            throw new InvalidBookingStateException(message);
        }
    }

    private BookingResponseDTO saveAndMap(Booking booking) {
        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toResponseDTO(saved);
    }

    private String parseRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            throw new SecurityViolationException("Missing requester role");
        }

        String normalized = rawRole.trim().toUpperCase(Locale.ROOT);
        if (!ROLE_ADMIN.equals(normalized) && !ROLE_USER.equals(normalized)) {
            throw new SecurityViolationException("Invalid requester role");
        }

        return normalized;
    }

    private void ensureAdmin(String requesterRole) {
        if (!ROLE_ADMIN.equals(parseRole(requesterRole))) {
            throw new SecurityViolationException("Only admins can perform this action");
        }
    }

    private void ensureUser(String requesterRole) {
        if (!ROLE_USER.equals(parseRole(requesterRole))) {
            throw new SecurityViolationException("Only users can perform this action");
        }
    }

    private void ensureCanAccessBooking(Booking booking, String callerRole, Long requesterUserId) {
        if (ROLE_ADMIN.equals(callerRole)) {
            return;
        }

        validateRequesterUserId(requesterUserId);
        if (!Objects.equals(booking.getUserId(), requesterUserId)) {
            throw new SecurityViolationException("Users can only access their own bookings");
        }
    }

    private void validateRequesterUserId(Long requesterUserId) {
        if (requesterUserId == null || requesterUserId <= 0) {
            throw new SecurityViolationException("Missing or invalid requester userId");
        }
    }

    private String sanitizeReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new InvalidBookingStateException("Rejection reason is required");
        }

        String normalized = reason.trim();
        if (normalized.length() > MAX_REJECTION_REASON_LENGTH) {
            throw new InvalidBookingStateException("Rejection reason is too long");
        }

        return normalized;
    }
}