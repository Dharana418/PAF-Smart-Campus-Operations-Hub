package com.smartcampus.booking_system.config;

import com.smartcampus.booking_system.model.Notification;
import com.smartcampus.booking_system.model.NotificationType;
import com.smartcampus.booking_system.model.RoleType;
import com.smartcampus.booking_system.model.UserAccount;
import com.smartcampus.booking_system.repository.NotificationRepository;
import com.smartcampus.booking_system.repository.UserAccountRepository;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(
            UserAccountRepository userAccountRepository, 
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.admin-email}") String adminEmail,
            @Value("${app.seed.admin-name}") String adminName,
            @Value("${app.seed.admin-password}") String adminPassword
    ) {
        return args -> {
            // Seed Primary Admin from Properties
            UserAccount admin = getOrCreateUser(
                    userAccountRepository,
                    passwordEncoder,
                    adminEmail,
                    adminName,
                    adminPassword,
                    RoleType.ROLE_ADMIN
            );

            // Seed Dharana's Specific Account if different
            getOrCreateUser(
                    userAccountRepository,
                    passwordEncoder,
                    "thiyunuwan567@gmail.com",
                    "Dharana Thilakarathna",
                    "Thiyunuwan#1234",
                    RoleType.ROLE_ADMIN
            );

            UserAccount staff = getOrCreateUser(
                    userAccountRepository,
                    passwordEncoder,
                    "staff@smartcampus.com",
                    "Operations Staff",
                    "Staff#1234",
                    RoleType.ROLE_STAFF
            );

            if (notificationRepository.count() == 0) {
                notificationRepository.save(createNotification(
                        "Server Maintenance",
                        "Planned maintenance tonight from 11 PM to 1 AM.",
                        NotificationType.WARNING,
                        admin
                ));
            }
        };
    }

    private UserAccount getOrCreateUser(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            String email,
            String name,
            String password,
            RoleType role
    ) {
        String normalizedEmail = email.toLowerCase(Locale.ROOT);
        UserAccount user = userAccountRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    UserAccount newUser = new UserAccount();
                    newUser.setEmail(normalizedEmail);
                    newUser.setFullName(name);
                    newUser.setProvider("seed");
                    newUser.setProviderId(normalizedEmail);
                    newUser.setRole(role);
                    return newUser;
                });

        // Ensure password is set/updated if provided
        if (password != null && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
        }
        
        return userAccountRepository.save(user);
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
