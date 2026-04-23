package com.smartcampus.booking.repository;

import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.entity.BookingStatus;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);
    
    @Query("""
    SELECT b FROM Booking b
    WHERE b.resourceId = :resourceId
    AND b.date = :date
    AND b.status = :status
    AND (
        b.startTime < :endTime AND :startTime < b.endTime
    )
""")
List<Booking> findConflictingBookings(
    @Param("resourceId") Long resourceId,
    @Param("date") LocalDate date,
    @Param("startTime") LocalTime startTime,
    @Param("endTime") LocalTime endTime,
    @Param("status") BookingStatus status
);

}