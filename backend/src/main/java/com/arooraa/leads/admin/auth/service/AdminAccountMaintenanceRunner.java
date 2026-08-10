package com.arooraa.leads.admin.auth.service;

import com.arooraa.leads.admin.auth.domain.AdminUser;
import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Operational account recovery: resets an existing admin's password, or creates a new admin
 * if the email doesn't exist yet. Deliberately NOT wired into normal application startup —
 * only runs when the operator explicitly activates the {@code admin-maintenance} Spring
 * profile (e.g. {@code --spring.profiles.active=admin-maintenance}) alongside the
 * AROORAA_ADMIN_RESET_* environment variables, which requires the same server/SSH access as
 * any other production maintenance action. This exists so a lost-password recovery never has
 * to fall back to hand-writing a BCrypt hash and inserting it via psql: the hash is always
 * produced by the application's own PasswordEncoder bean.
 *
 * See docs/admin-account-recovery.md for the full operational procedure.
 */
@Component
@Profile("admin-maintenance")
public class AdminAccountMaintenanceRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountMaintenanceRunner.class);
    private static final int MIN_PASSWORD_LENGTH = 8;

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String displayName;

    public AdminAccountMaintenanceRunner(
            AdminUserRepository repository,
            PasswordEncoder passwordEncoder,
            @Value("${arooraa.admin.reset-email:}") String email,
            @Value("${arooraa.admin.reset-password:}") String password,
            @Value("${arooraa.admin.reset-name:Admin}") String displayName) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
        this.displayName = displayName;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() || password.isBlank()) {
            log.error("admin-maintenance profile is active but AROORAA_ADMIN_RESET_EMAIL / "
                    + "AROORAA_ADMIN_RESET_PASSWORD are not both set. No account was changed.");
            return;
        }

        if (password.length() < MIN_PASSWORD_LENGTH) {
            log.error("AROORAA_ADMIN_RESET_PASSWORD is shorter than {} characters; refusing to "
                    + "set a weak password. No account was changed.", MIN_PASSWORD_LENGTH);
            return;
        }

        String normalizedEmail = email.toLowerCase(java.util.Locale.ROOT).trim();
        Optional<AdminUser> existing = repository.findByEmail(normalizedEmail);
        String newHash = passwordEncoder.encode(password);

        if (existing.isPresent()) {
            AdminUser admin = existing.get();
            admin.resetPasswordHash(newHash);
            repository.save(admin);
            log.info("admin-maintenance: password reset for existing admin email={}", normalizedEmail);
            if (!admin.isActive()) {
                log.warn("admin-maintenance: email={} is currently INACTIVE — the password was reset but the "
                        + "account still cannot log in. Reactivate separately if that is intended "
                        + "(see docs/admin-account-recovery.md).", normalizedEmail);
            }
        } else {
            AdminUser admin = new AdminUser(normalizedEmail, newHash, displayName);
            repository.save(admin);
            log.info("admin-maintenance: created new admin email={}", normalizedEmail);
        }
    }
}
