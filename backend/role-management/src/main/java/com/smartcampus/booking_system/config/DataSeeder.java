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
import java.util.Arrays;
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

            UserAccount student = getOrCreateUser(
                    userAccountRepository,
                    passwordEncoder,
                    "student@smartcampus.com",
                    "Sample Student",
                    "Student#1234",
                    RoleType.ROLE_STUDENT
            );

            // Seed Additional Users for Role Management
            getOrCreateUser(userAccountRepository, passwordEncoder, "tech.user@smartcampus.com", "Technician Alpha", "Tech#1234", RoleType.ROLE_STAFF);
            getOrCreateUser(userAccountRepository, passwordEncoder, "intern.user@smartcampus.com", "Student Intern", "Intern#1234", RoleType.ROLE_STUDENT);

            if (notificationRepository.count() <= 1) {
                // Admin Notifications (5 Total)
                notificationRepository.save(createNotification("System Diagnostic Complete", "All modules are operating within normal parameters.", NotificationType.SUCCESS, admin));
                notificationRepository.save(createNotification("Security Audit Pending", "Please review the access logs for the last 24 hours.", NotificationType.WARNING, admin));
                notificationRepository.save(createNotification("Database Backup Successful", "Global snapshot has been stored in AWS S3.", NotificationType.SUCCESS, admin));
                notificationRepository.save(createNotification("New Role Request", "User 'intern.user' requested elevated access.", NotificationType.INFO, admin));
                notificationRepository.save(createNotification("Server Maintenance", "Core API cluster will restart at midnight.", NotificationType.CRITICAL, admin));
                
                // Student Notifications (5 Total)
                notificationRepository.save(createNotification("Booking Approved", "Your request for MLH-01 has been approved.", NotificationType.SUCCESS, student));
                notificationRepository.save(createNotification("Maintenance Update", "Technician assigned to your ticket #102.", NotificationType.INFO, student));
                notificationRepository.save(createNotification("System Alert", "Main Library will be closed for maintenance tomorrow.", NotificationType.WARNING, student));
                notificationRepository.save(createNotification("Booking Rejected", "MLH-01 is unavailable for the selected slot.", NotificationType.CRITICAL, student));
                notificationRepository.save(createNotification("Ticket Resolved", "Issue with Projector P-101 has been fixed.", NotificationType.SUCCESS, student));

                // Staff Notifications (5 Total)
                notificationRepository.save(createNotification("New Maintenance Ticket", "A new fault has been reported in Block B.", NotificationType.INFO, staff));
                notificationRepository.save(createNotification("Critical System Fault", "Server room temperature is exceeding limits.", NotificationType.CRITICAL, staff));
                notificationRepository.save(createNotification("Inventory Update", "50 new lab kits have been added to the registry.", NotificationType.SUCCESS, staff));
                notificationRepository.save(createNotification("Shift Reminder", "Your monitoring shift starts at 08:00 AM.", NotificationType.WARNING, staff));
                notificationRepository.save(createNotification("Report Generated", "Weekly utilization report is ready for review.", NotificationType.INFO, staff));
            }

            if (resourceRepository.count() == 0) {
                resourceRepository.save(createResource("Main Lecture Hall (MLH-01)", "Lecture Hall", 200, "Block A", "ACTIVE"));
                resourceRepository.save(createResource("Computing Lab 01 (CL-01)", "Lab", 50, "Block B", "ACTIVE"));
                resourceRepository.save(createResource("Projector P-101", "Equipment", 1, "Media Center", "ACTIVE"));
                resourceRepository.save(createResource("Meeting Room 1 (MR-01)", "Meeting Room", 12, "Admin Block", "ACTIVE"));
                resourceRepository.save(createResource("Conference Hall", "Lecture Hall", 150, "Block C", "OUT_OF_SERVICE"));
            }

            if (bookingRepository.count() == 0) {
                List<Resource> resources = resourceRepository.findAll();
                if (!resources.isEmpty()) {
                    String resId = resources.get(0).getId();
                    // Student Bookings (5)
                    bookingRepository.save(createBooking(resId, student.getEmail(), "Workshop", "APPROVED", -2));
                    bookingRepository.save(createBooking(resId, student.getEmail(), "Study Session", "PENDING", 1));
                    bookingRepository.save(createBooking(resId, student.getEmail(), "Club Meeting", "REJECTED", -5));
                    bookingRepository.save(createBooking(resId, student.getEmail(), "Exam Prep", "APPROVED", 3));
                    bookingRepository.save(createBooking(resId, student.getEmail(), "Final Project", "PENDING", 7));

                    // Staff Bookings (5)
                    bookingRepository.save(createBooking(resId, staff.getEmail(), "Resource Audit", "APPROVED", -1));
                    bookingRepository.save(createBooking(resId, staff.getEmail(), "Staff Training", "PENDING", 2));
                    bookingRepository.save(createBooking(resId, staff.getEmail(), "Equipment Setup", "APPROVED", 0));
                    bookingRepository.save(createBooking(resId, staff.getEmail(), "Inventory Count", "APPROVED", 5));
                    bookingRepository.save(createBooking(resId, staff.getEmail(), "Maintenance Check", "PENDING", 4));

                    // Admin Bookings (5)
                    bookingRepository.save(createBooking(resId, admin.getEmail(), "System Launch", "APPROVED", -10));
                    bookingRepository.save(createBooking(resId, admin.getEmail(), "VIP Visit", "APPROVED", 0));
                    bookingRepository.save(createBooking(resId, admin.getEmail(), "Emergency Meeting", "APPROVED", 1));
                    bookingRepository.save(createBooking(resId, admin.getEmail(), "Board Review", "PENDING", 10));
                    bookingRepository.save(createBooking(resId, admin.getEmail(), "Security Drill", "APPROVED", 15));
                }
            }

            if (ticketRepository.count() == 0) {
                List<Resource> resources = resourceRepository.findAll();
                if (!resources.isEmpty()) {
                    String resId = resources.get(0).getId();
                    // Tickets assigned to Staff (5)
                    ticketRepository.save(createTicket(resId, student.getEmail(), staff.getEmail(), "Projector not working", "HIGH", "OPEN"));
                    ticketRepository.save(createTicket(resId, student.getEmail(), staff.getEmail(), "AC making noise", "MEDIUM", "IN_PROGRESS"));
                    ticketRepository.save(createTicket(resId, student.getEmail(), staff.getEmail(), "Broken chair", "LOW", "RESOLVED"));
                    ticketRepository.save(createTicket(resId, student.getEmail(), staff.getEmail(), "Internet issues", "CRITICAL", "OPEN"));
                    ticketRepository.save(createTicket(resId, student.getEmail(), staff.getEmail(), "Light bulb fused", "LOW", "CLOSED"));

                    // Tickets assigned to Admin (5)
                    ticketRepository.save(createTicket(resId, staff.getEmail(), admin.getEmail(), "Database Leak", "CRITICAL", "OPEN"));
                    ticketRepository.save(createTicket(resId, staff.getEmail(), admin.getEmail(), "Auth Failure", "HIGH", "IN_PROGRESS"));
                    ticketRepository.save(createTicket(resId, staff.getEmail(), admin.getEmail(), "Network Outage", "CRITICAL", "RESOLVED"));
                    ticketRepository.save(createTicket(resId, staff.getEmail(), admin.getEmail(), "UI Glitch", "LOW", "OPEN"));
                    ticketRepository.save(createTicket(resId, staff.getEmail(), admin.getEmail(), "Log Rotation Error", "MEDIUM", "CLOSED"));
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
        t.setDescription("Sample description for " + title);
        t.setCreatedAt(LocalDateTime.now().minusDays(3));
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
