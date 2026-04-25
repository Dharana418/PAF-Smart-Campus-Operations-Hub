package com.smartcampus.booking_system.security;

import com.smartcampus.booking_system.model.UserAccount;
import com.smartcampus.booking_system.service.JwtService;
import com.smartcampus.booking_system.service.UserAccountService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserAccountService userAccountService;
    private final JwtService jwtService;
    private final String frontendRedirectUri;

    public OAuth2AuthenticationSuccessHandler(
            UserAccountService userAccountService,
            JwtService jwtService,
            @Value("${app.frontend.redirect-uri}") String frontendRedirectUri
    ) {
        this.userAccountService = userAccountService;
        this.jwtService = jwtService;
        this.frontendRedirectUri = frontendRedirectUri;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        UserAccount user = userAccountService.processGoogleUser(oauth2User);

        String token = jwtService.generateToken(user.getEmail(), user.getFullName(), user.getRole());
        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendRedirectUri)
                .queryParam("token", token)
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
