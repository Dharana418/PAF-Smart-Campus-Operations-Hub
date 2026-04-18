package com.smartcampus.booking_system.config;

import com.smartcampus.booking_system.model.Notification;
import com.smartcampus.booking_system.model.NotificationType;
import com.smartcampus.booking_system.model.RoleType;
import com.smartcampus.booking_system.model.UserAccount;
import com.smartcampus.booking_system.repository.NotificationRepository;
import com.smartcampus.booking_system.repository.UserAccountRepository;
import java.util.Locale;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(UserAccountRepository userAccountRepository, NotificationRepository notificationRepository) {
        return args -> {
            UserAccount admin = getOrCreateUser(
                    userAccountRepository,
                    "admin@smartcampus.com",
                    "System Admin",
                    RoleType.ROLE_ADMIN
            );
            UserAccount staff = getOrCreateUser(
                    userAccountRepository,
                    "staff@smartcampus.com",
                    "Operations Staff",
                    RoleType.ROLE_STAFF
            );

            if (notificationRepository.count() == 0) {
                notificationRepository.save(createNotification(
                        "Server Maintenance",
                        "Planned maintenance tonight from 11 PM to 1 AM.",
                        NotificationType.WARNING,
                        admin
                ));
                notificationRepository.save(createNotification(
                        "Room Allocation Update",
                        "Lecture hall booking windows open for next week.",
                        NotificationType.INFO,
                        staff
                ));
            }
        };
    }

    private UserAccount getOrCreateUser(
            UserAccountRepository userAccountRepository,
            String email,
            String name,
            RoleType role
    ) {
        return userAccountRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseGet(() -> {
                    UserAccount user = new UserAccount();
                    user.setEmail(email.toLowerCase(Locale.ROOT));
                    user.setFullName(name);
                    user.setProvider("seed");
                    user.setProviderId(email.toLowerCase(Locale.ROOT));
                    user.setRole(role);
                    return userAccountRepository.save(user);
                });
    }

    private Notification createNotification(String title, String message, NotificationType type, UserAccount recipient) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setRecipient(recipient);
        return notification;
    }
}
