package com.arooraa.leads.admin.auth.service;

import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import com.arooraa.leads.admin.auth.web.dto.AdminSessionResponse;
import com.arooraa.leads.exception.RateLimitExceededException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
public class AdminAuthService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);
    private static final String GENERIC_LOGIN_FAILURE = "Invalid email or password.";

    private final AuthenticationManager authenticationManager;
    private final AdminUserRepository adminUserRepository;
    private final AdminLoginRateLimiter rateLimiter;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AdminAuthService(AuthenticationManager authenticationManager, AdminUserRepository adminUserRepository,
                             AdminLoginRateLimiter rateLimiter) {
        this.authenticationManager = authenticationManager;
        this.adminUserRepository = adminUserRepository;
        this.rateLimiter = rateLimiter;
    }

    @Transactional
    public AdminSessionResponse login(String email, String password, HttpServletRequest request, HttpServletResponse response) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        if (!rateLimiter.tryAcquire(normalizedEmail)) {
            log.warn("admin login rejected reason=RATE_LIMITED email={}", normalizedEmail);
            throw new RateLimitExceededException();
        }

        Authentication authResult;
        try {
            authResult = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, password));
        } catch (AuthenticationException e) {
            log.warn("admin login rejected reason=INVALID_CREDENTIALS email={}", normalizedEmail);
            throw new InvalidAdminCredentialsException(GENERIC_LOGIN_FAILURE);
        }

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authResult);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        AdminPrincipal principal = (AdminPrincipal) authResult.getPrincipal();
        adminUserRepository.findById(principal.getId()).ifPresent(admin -> {
            admin.recordLogin(Instant.now());
            adminUserRepository.save(admin);
        });

        log.info("admin login accepted email={}", normalizedEmail);
        return new AdminSessionResponse(principal.getId(), principal.getUsername(), principal.getDisplayName());
    }

    public AdminSessionResponse currentSession(Authentication authentication) {
        AdminPrincipal principal = (AdminPrincipal) authentication.getPrincipal();
        return new AdminSessionResponse(principal.getId(), principal.getUsername(), principal.getDisplayName());
    }

    public static class InvalidAdminCredentialsException extends RuntimeException {
        public InvalidAdminCredentialsException(String message) {
            super(message);
        }
    }
}
