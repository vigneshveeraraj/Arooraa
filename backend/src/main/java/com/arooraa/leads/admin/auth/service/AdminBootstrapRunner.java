package com.arooraa.leads.admin.auth.service;

import com.arooraa.leads.admin.auth.domain.AdminUser;
import com.arooraa.leads.admin.auth.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the first admin_users row from environment variables, only when the table is
 * empty. Never creates an admin with a hard-coded default password, and never logs the
 * password itself. Re-running with an admin already present is a safe no-op — this is
 * meant to run on every application startup, not as a one-off script.
 */
@Component
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);
    private static final int MIN_PASSWORD_LENGTH = 8;

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final String bootstrapEmail;
    private final String bootstrapPassword;
    private final String bootstrapName;

    public AdminBootstrapRunner(
            AdminUserRepository repository,
            PasswordEncoder passwordEncoder,
            @Value("${arooraa.admin.bootstrap-email:}") String bootstrapEmail,
            @Value("${arooraa.admin.bootstrap-password:}") String bootstrapPassword,
            @Value("${arooraa.admin.bootstrap-name:Admin}") String bootstrapName) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapEmail = bootstrapEmail;
        this.bootstrapPassword = bootstrapPassword;
        this.bootstrapName = bootstrapName;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }

        if (bootstrapEmail.isBlank() || bootstrapPassword.isBlank()) {
            log.warn("No admin user exists yet and AROORAA_ADMIN_BOOTSTRAP_EMAIL / "
                    + "AROORAA_ADMIN_BOOTSTRAP_PASSWORD are not set. Set both and restart "
                    + "the application to create the first admin.");
            return;
        }

        if (bootstrapPassword.length() < MIN_PASSWORD_LENGTH) {
            log.warn("AROORAA_ADMIN_BOOTSTRAP_PASSWORD is shorter than {} characters; refusing "
                    + "to bootstrap an admin with a weak password. Set a stronger password and restart.",
                    MIN_PASSWORD_LENGTH);
            return;
        }

        AdminUser admin = new AdminUser(bootstrapEmail, passwordEncoder.encode(bootstrapPassword), bootstrapName);
        repository.save(admin);
        log.info("Bootstrapped initial admin user email={}", admin.getEmail());
    }
}
