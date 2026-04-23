package com.smartcampus.booking.mapper;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingResponseDTO;
import com.smartcampus.booking.entity.Booking;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BookingMapper {

    public Booking toEntity(BookingRequestDTO dto) {
        Booking booking = new Booking();
        booking.setUserId(dto.userId);
        booking.setResourceId(dto.resourceId);
        booking.setDate(dto.date);
        booking.setStartTime(dto.startTime);
        booking.setEndTime(dto.endTime);
        booking.setPurpose(dto.purpose);
        booking.setAttendees(dto.attendees);
        return booking;
    }

    public BookingResponseDTO toResponseDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.id = booking.getId();
        dto.userId = booking.getUserId();
        dto.resourceId = booking.getResourceId();
        dto.date = booking.getDate();
        dto.startTime = booking.getStartTime();
        dto.endTime = booking.getEndTime();
        dto.purpose = booking.getPurpose();
        dto.attendees = booking.getAttendees();
        dto.status = booking.getStatus();
        dto.adminReason = booking.getAdminReason();
        dto.createdAt = booking.getCreatedAt();
        return dto;
    }

    public List<BookingResponseDTO> toResponseDTOList(List<Booking> bookings) {
        return bookings.stream().map(this::toResponseDTO).toList();
    }
}
