package com.smartcampus.booking_system.service;

import com.smartcampus.booking_system.dto.UserProfileDto;
import com.smartcampus.booking_system.model.RoleType;
import com.smartcampus.booking_system.model.UserAccount;
import com.smartcampus.booking_system.repository.UserAccountRepository;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final Set<String> adminEmails;

    public UserAccountService(
            UserAccountRepository userAccountRepository,
            @Value("${app.security.admin-emails:}") String adminEmails
    ) {
        this.userAccountRepository = userAccountRepository;
        this.adminEmails = Arrays.stream(adminEmails.split(","))
                .map(String::trim)
                .map(value -> value.toLowerCase(Locale.ROOT))
                .filter(value -> !value.isBlank())
                .collect(Collectors.toSet());
    }

    @Transactional
    public UserAccount processGoogleUser(OAuth2User oauthUser) {
        String email = oauthUser.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Google account email is required");
        }

        String normalizedEmail = email.toLowerCase(Locale.ROOT);
        String fullName = oauthUser.getAttribute("name");
        String providerId = oauthUser.getAttribute("sub");
        if (providerId == null || providerId.isBlank()) {
            providerId = normalizedEmail;
        }

        UserAccount user = userAccountRepository.findByEmail(normalizedEmail)
                .orElseGet(UserAccount::new);

        user.setEmail(normalizedEmail);
        user.setFullName(fullName != null && !fullName.isBlank() ? fullName : normalizedEmail);
        user.setProvider("google");
        user.setProviderId(providerId);

        if (user.getRole() == null) {
            long userCount = userAccountRepository.count();
            user.setRole(adminEmails.contains(normalizedEmail) || userCount == 0 ? RoleType.ROLE_ADMIN : RoleType.ROLE_STUDENT);
        } else if (adminEmails.contains(normalizedEmail)) {
            user.setRole(RoleType.ROLE_ADMIN);
        }

        return userAccountRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserAccount getRequiredByEmail(String email) {
        return userAccountRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    @Transactional(readOnly = true)
    public UserProfileDto toProfile(UserAccount user) {
        return new UserProfileDto(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }

    @Transactional(readOnly = true)
    public java.util.List<UserProfileDto> getAllProfiles() {
        return userAccountRepository.findAll().stream().map(this::toProfile).toList();
    }

    @Transactional
    public UserProfileDto updateRole(String email, RoleType role) {
        UserAccount user = getRequiredByEmail(email);
        user.setRole(role);
        return toProfile(userAccountRepository.save(user));
    }
}
