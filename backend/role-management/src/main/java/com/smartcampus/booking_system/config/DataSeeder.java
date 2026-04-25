package com.smartcampus.booking_system.config;

import com.smartcampus.booking_system.model.Booking;
import com.smartcampus.booking_system.model.IncidentTicket;
import com.smartcampus.booking_system.model.Notification;
import com.smartcampus.booking_system.model.NotificationType;
import com.smartcampus.booking_system.model.Resource;
import com.smartcampus.booking_system.model.RoleType;
import com.smartcampus.booking_system.model.UserAccount;
import com.smartcampus.booking_system.repository.BookingRepository;
import com.smartcampus.booking_system.repository.NotificationRepository;
import com.smartcampus.booking_system.repository.ResourceRepository;
import com.smartcampus.booking_system.repository.TicketRepository;
import com.smartcampus.booking_system.repository.UserAccountRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
            ResourceRepository resourceRepository,
            BookingRepository bookingRepository,
            TicketRepository ticketRepository,
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

            // Seed Dharana's Specific Account
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

            UserAccount student = getOrCreateUser(
                    userAccountRepository,
                    passwordEncoder,
                    "student@smartcampus.com",
                    "Sample Student",
                    "Student#1234",
                    RoleType.ROLE_STUDENT
            );

            // Seed Additional Users
            getOrCreateUser(userAccountRepository, passwordEncoder, "tech.user@smartcampus.com", "Technician Alpha", "Tech#1234", RoleType.ROLE_STAFF);
            getOrCreateUser(userAccountRepository, passwordEncoder, "intern.user@smartcampus.com", "Student Intern", "Intern#1234", RoleType.ROLE_STUDENT);

            // Notifications
            if (notificationRepository.countByRecipient(admin) < 5) {
                notificationRepository.save(createNotification("System Diagnostic Complete", "All modules are operating within normal parameters.", NotificationType.SUCCESS, admin));
                notificationRepository.save(createNotification("Security Audit Pending", "Please review the access logs for the last 24 hours.", NotificationType.WARNING, admin));
                notificationRepository.save(createNotification("Database Backup Successful", "Global snapshot has been stored in AWS S3.", NotificationType.SUCCESS, admin));
                notificationRepository.save(createNotification("New Role Request", "User 'intern.user' requested elevated access.", NotificationType.INFO, admin));
                notificationRepository.save(createNotification("Server Maintenance", "Core API cluster will restart at midnight.", NotificationType.CRITICAL, admin));
            }
            
            if (resourceRepository.count() < 5) {
                resourceRepository.save(createResource("Main Lecture Hall (MLH-01)", "Lecture Hall", 200, "Block A", "ACTIVE"));
                resourceRepository.save(createResource("Computing Lab 01 (CL-01)", "Lab", 50, "Block B", "ACTIVE"));
                resourceRepository.save(createResource("Projector P-101", "Equipment", 1, "Media Center", "ACTIVE"));
                resourceRepository.save(createResource("Meeting Room 1 (MR-01)", "Meeting Room", 12, "Admin Block", "ACTIVE"));
                resourceRepository.save(createResource("Conference Hall", "Lecture Hall", 150, "Block C", "OUT_OF_SERVICE"));
            }

            if (bookingRepository.count() < 10) {
                List<Resource> resources = resourceRepository.findAll();
                if (!resources.isEmpty()) {
                    String resId = resources.get(0).getId();
                    if (bookingRepository.findByUserEmail(student.getEmail()).isEmpty()) {
                        bookingRepository.save(createBooking(resId, student.getEmail(), "Workshop", "APPROVED", -2));
                        bookingRepository.save(createBooking(resId, student.getEmail(), "Study Session", "PENDING", 1));
                    }
                    if (bookingRepository.findByUserEmail(staff.getEmail()).isEmpty()) {
                        bookingRepository.save(createBooking(resId, staff.getEmail(), "Resource Audit", "APPROVED", -1));
                    }
                }
            }

            if (ticketRepository.count() < 5) {
                List<Resource> resources = resourceRepository.findAll();
                if (!resources.isEmpty()) {
                    String resId = resources.get(0).getId();
                    if (ticketRepository.findByAssignedTechnicianEmail(staff.getEmail()).isEmpty()) {
                        ticketRepository.save(createTicket(resId, student.getEmail(), staff.getEmail(), "Projector not working", "HIGH", "OPEN"));
                        ticketRepository.save(createTicket(resId, student.getEmail(), staff.getEmail(), "AC making noise", "MEDIUM", "IN_PROGRESS"));
                    }
                }
            }
        };
    }

    private Booking createBooking(String resId, String email, String purpose, String status, int daysOffset) {
        Booking b = new Booking();
        b.setResourceId(resId);
        b.setUserEmail(email);
        b.setPurpose(purpose);
        b.setStatus(status);
        b.setStartTime(LocalDateTime.now().plusDays(daysOffset));
        b.setEndTime(LocalDateTime.now().plusDays(daysOffset).plusHours(2));
        b.setCreatedAt(LocalDateTime.now().minusDays(10));
        return b;
    }

    private IncidentTicket createTicket(String resId, String email, String techEmail, String title, String priority, String status) {
        IncidentTicket t = new IncidentTicket();
        t.setResourceId(resId);
        t.setReporterEmail(email);
        t.setAssignedTechnicianEmail(techEmail);
        t.setTitle(title);
        t.setPriority(priority);
        t.setStatus(status);
        t.setDescription("Automated diagnostic report: " + title);
        t.setCreatedAt(LocalDateTime.now().minusDays(3));
        
        List<IncidentTicket.Comment> comments = new ArrayList<>();
        comments.add(new IncidentTicket.Comment(java.util.UUID.randomUUID().toString(), email, "I noticed this issue during my 8 AM lecture.", LocalDateTime.now().minusDays(2)));
        t.setComments(comments);
        
        return t;
    }

    private Resource createResource(String name, String type, int capacity, String location, String status) {
        Resource r = new Resource();
        r.setName(name);
        r.setType(type);
        r.setCapacity(capacity);
        r.setLocation(location);
        r.setStatus(status);
        return r;
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
                .orElse(null);

        if (user == null) {
            user = new UserAccount();
            user.setEmail(normalizedEmail);
            user.setFullName(name);
            user.setProvider("seed");
            user.setProviderId(normalizedEmail);
            user.setRole(role);
            if (password != null && !password.isBlank()) {
                user.setPassword(passwordEncoder.encode(password));
            }
            return userAccountRepository.save(user);
        }

        // If user exists, we might want to update some fields but maybe not password every time
        // However, to be safe for dev-login, we ensure the password matches what's in seeder
        if (password != null && !password.isBlank()) {
            // Only update if it doesn't match to avoid constant DB writes and salt changes
            if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(password));
                return userAccountRepository.save(user);
            }
        }
        
        return user;
    }

    private Notification createNotification(String title, String message, NotificationType type, UserAccount recipient) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setRecipient(recipient);
        notification.setCreatedAt(LocalDateTime.now().minusHours((int)(Math.random() * 48)));
        return notification;
    }
}
