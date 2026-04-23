package com.smartcampus.booking_system.config;

import com.smartcampus.booking_system.model.RoleType;
import com.smartcampus.booking_system.model.UserAccount;
import com.smartcampus.booking_system.repository.UserAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initAdminUser(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "thiyunuwan567@gail.com";
            if (userAccountRepository.findByEmail(adminEmail).isEmpty()) {
                UserAccount admin = new UserAccount();
                admin.setEmail(adminEmail);
                admin.setFullName("Thiyunuwan Admin");
                admin.setProvider("local");
                admin.setRole(RoleType.ROLE_ADMIN);
                admin.setPassword(passwordEncoder.encode("Thiyunuwan#1234"));
                userAccountRepository.save(admin);
                System.out.println("Admin user initialized successfully.");
            } else {
                // If it exists but has no password, let's update it just in case
                UserAccount admin = userAccountRepository.findByEmail(adminEmail).get();
                if (admin.getPassword() == null) {
                    admin.setPassword(passwordEncoder.encode("Thiyunuwan#1234"));
                    admin.setRole(RoleType.ROLE_ADMIN);
                    userAccountRepository.save(admin);
                    System.out.println("Admin user password updated.");
                }
            }
        };
    }
}
