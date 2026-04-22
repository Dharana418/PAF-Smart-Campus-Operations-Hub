package com.smartcampus.booking_system.repository;

import com.smartcampus.booking_system.model.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

    Optional<Notification> findByIdAndRecipientEmail(String id, String recipientEmail);

    long countByRecipientEmailAndIsReadFalse(String recipientEmail);
}
