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

    public NotificationDto createNotification(String senderEmail, CreateNotificationRequest request) {
        UserAccount sender = userAccountService.getRequiredByEmail(senderEmail);

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
                notification.setSender(sender);
                notificationRepository.save(notification);
            }
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
        notification.setSender(sender);

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

    public java.util.List<NotificationDto> getSentBy(String email) {
        UserAccount sender = userAccountService.getRequiredByEmail(email);
        return notificationRepository.findBySenderOrderByCreatedAtDesc(sender)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public void deleteNotification(String senderEmail, String id) {
        UserAccount sender = userAccountService.getRequiredByEmail(senderEmail);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        if (!notification.getSender().getEmail().equals(sender.getEmail())) {
            throw new IllegalStateException("Unauthorized to delete this notification");
        }
        
        notificationRepository.delete(notification);
    }

    public NotificationDto updateNotification(String senderEmail, String id, CreateNotificationRequest request) {
        UserAccount sender = userAccountService.getRequiredByEmail(senderEmail);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getSender().getEmail().equals(sender.getEmail())) {
            throw new IllegalStateException("Unauthorized to update this notification");
        }

        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setType(request.type());
        
        return toDto(notificationRepository.save(notification));
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
