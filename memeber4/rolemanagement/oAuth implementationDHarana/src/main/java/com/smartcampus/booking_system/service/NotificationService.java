package com.smartcampus.booking_system.service;

import com.smartcampus.booking_system.dto.CreateNotificationRequest;
import com.smartcampus.booking_system.dto.NotificationDto;
import com.smartcampus.booking_system.dto.NotificationListResponse;
import com.smartcampus.booking_system.model.Notification;
import com.smartcampus.booking_system.model.UserAccount;
import com.smartcampus.booking_system.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserAccountService userAccountService;

    public NotificationService(NotificationRepository notificationRepository, UserAccountService userAccountService) {
        this.notificationRepository = notificationRepository;
        this.userAccountService = userAccountService;
    }

    public NotificationDto createNotification(CreateNotificationRequest request) {
        return createNotification(request.recipientEmail(), request.title(), request.message(), request.type());
    }

    public NotificationDto createNotification(String recipientEmail, String title, String message, com.smartcampus.booking_system.model.NotificationType type) {
        UserAccount recipient = userAccountService.getRequiredByEmail(recipientEmail);

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setRecipient(recipient);

        Notification saved = notificationRepository.save(notification);
        return toDto(saved);
    }

    public NotificationListResponse getForUser(String email) {
        UserAccount recipient = userAccountService.getRequiredByEmail(email);
        java.util.List<NotificationDto> notifications = notificationRepository
                .findByRecipientOrderByCreatedAtDesc(recipient)
                .stream()
                .map(this::toDto)
                .toList();

        long unreadCount = notificationRepository.countByRecipientAndIsReadFalse(recipient);
        return new NotificationListResponse(notifications, unreadCount);
    }

    public NotificationDto markRead(String email, String notificationId, boolean read) {
        UserAccount recipient = userAccountService.getRequiredByEmail(email);
        Notification notification = notificationRepository.findByIdAndRecipient(notificationId, recipient)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        notification.setRead(read);
        return toDto(notificationRepository.save(notification));
    }

    private NotificationDto toDto(Notification notification) {
        return new NotificationDto(
            notification.getId(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getType(),
            notification.isRead(),
            notification.getCreatedAt()
        );
    }
}
