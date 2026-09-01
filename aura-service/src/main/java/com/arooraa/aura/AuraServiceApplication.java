package com.arooraa.aura;

import com.arooraa.aura.config.AuraSafetyProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Aura — AROORAA's conversational digital representative. A dedicated service, deliberately
 * separate from {@code lead-service}: its own application, its own database, its own deployment
 * unit (see this module's ARCHITECTURE.md). This milestone (A0/A1) ships the foundation only
 * — domain model, pgvector-backed persistence, provider-neutral interfaces, and the public
 * knowledge/approval boundary. No chat HTTP surface exists yet.
 */
@SpringBootApplication
@EnableConfigurationProperties(AuraSafetyProperties.class)
public class AuraServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuraServiceApplication.class, args);
    }
}
