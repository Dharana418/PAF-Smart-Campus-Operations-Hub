package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingResponseDTO;
import com.smartcampus.booking.entity.*;
import com.smartcampus.booking.execption.BookingConflictException;
import com.smartcampus.booking.execption.BookingNotFoundException;
import com.smartcampus.booking.execption.InvalidBookingStateException;
import com.smartcampus.booking.mapper.BookingMapper;
import com.smartcampus.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    public BookingResponseDTO getBookingById(Long bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        return bookingMapper.toResponseDTO(booking);
    }

    public List<BookingResponseDTO> getBookings(Long userId) {
        List<Booking> bookings = (userId != null)
                ? bookingRepository.findByUserId(userId)
                : bookingRepository.findAll();
        return bookingMapper.toResponseDTOList(bookings);
    }

    public BookingResponseDTO approveBooking(Long bookingId) {
        Booking booking = getBookingOrThrow(bookingId);

        ensureStatus(booking, BookingStatus.PENDING, "Only PENDING bookings can be approved");

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Booking conflict detected");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return saveAndMap(booking);
    }

    public BookingResponseDTO createBooking(BookingRequestDTO dto) {
        Booking booking = bookingMapper.toEntity(dto);
        booking.setStatus(BookingStatus.PENDING);
        return saveAndMap(booking);
    }

    public BookingResponseDTO rejectBooking(Long bookingId, String reason) {
        Booking booking = getBookingOrThrow(bookingId);
        ensureStatus(booking, BookingStatus.PENDING, "Only PENDING bookings can be rejected");
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason);
        return saveAndMap(booking);
    }

    public BookingResponseDTO cancelBooking(Long bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
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
}