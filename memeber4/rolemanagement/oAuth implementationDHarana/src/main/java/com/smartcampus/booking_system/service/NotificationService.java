package com.smartcampus.booking_system.service;

import com.smartcampus.booking_system.dto.CreateNotificationRequest;
import com.smartcampus.booking_system.dto.NotificationDto;
import com.smartcampus.booking_system.dto.NotificationListResponse;
import com.smartcampus.booking_system.model.Notification;
import com.smartcampus.booking_system.model.UserAccount;
import com.smartcampus.booking_system.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserAccountService userAccountService;

    public NotificationService(NotificationRepository notificationRepository, UserAccountService userAccountService) {
        this.notificationRepository = notificationRepository;
        this.userAccountService = userAccountService;
    }

    @Transactional
    public NotificationDto createNotification(CreateNotificationRequest request) {
        UserAccount recipient = userAccountService.getRequiredByEmail(request.recipientEmail());

        Notification notification = new Notification();
        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setType(request.type());
        notification.setRead(false);
        notification.setRecipient(recipient);

        Notification saved = notificationRepository.save(notification);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public NotificationListResponse getForUser(String email) {
        java.util.List<NotificationDto> notifications = notificationRepository
                .findByRecipientEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::toDto)
                .toList();

        long unreadCount = notificationRepository.countByRecipientEmailAndIsReadFalse(email);
        return new NotificationListResponse(notifications, unreadCount);
    }

    @Transactional
    public NotificationDto markRead(String email, String notificationId, boolean read) {
        Notification notification = notificationRepository.findByIdAndRecipientEmail(notificationId, email)
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
