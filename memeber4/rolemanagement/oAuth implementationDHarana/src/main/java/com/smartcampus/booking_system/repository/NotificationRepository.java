package com.smartcampus.booking_system.repository;

import com.smartcampus.booking_system.model.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

    Optional<Notification> findByIdAndRecipientEmail(Long id, String recipientEmail);

    long countByRecipientEmailAndIsReadFalse(String recipientEmail);
}
