package com.smartcampus.booking_system.repository;

import com.smartcampus.booking_system.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserEmail(String email);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(String status);
    List<Booking> findByResourceIdAndStatusIn(String resourceId, List<String> statuses);
    
    // For conflict checking
    List<Booking> findByResourceIdAndStatusInAndStartTimeBeforeAndEndTimeAfter(
            String resourceId, List<String> statuses, LocalDateTime endTime, LocalDateTime startTime);
}
