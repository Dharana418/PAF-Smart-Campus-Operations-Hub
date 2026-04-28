package com.smartcampus.booking_system.repository;

import com.smartcampus.booking_system.model.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.booking_system.model.UserAccount;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(UserAccount recipient);

    List<Notification> findBySenderOrderByCreatedAtDesc(UserAccount sender);

    Optional<Notification> findByIdAndRecipient(String id, UserAccount recipient);

    long countByRecipientAndIsReadFalse(UserAccount recipient);

    long countByRecipient(UserAccount recipient);
}
