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
        if (request.isBroadcast()) {
            java.util.List<UserAccount> allUsers = userAccountService.getAllUsersRaw();
            for (UserAccount user : allUsers) {
                Notification notification = new Notification();
                notification.setTitle(request.title());
                notification.setMessage(request.message());
                notification.setType(request.type());
                notification.setRead(false);
                notification.setBroadcast(true);
                notification.setRecipient(user);
                notificationRepository.save(notification);
            }
            // Return a dummy DTO for the response (since we created many)
            return new NotificationDto("broadcast", request.title(), request.message(), request.type(), false, java.time.LocalDateTime.now());
        }

        UserAccount recipient = userAccountService.getRequiredByEmail(request.recipientEmail());

        Notification notification = new Notification();
        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setType(request.type());
        notification.setRead(false);
        notification.setBroadcast(false);
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
