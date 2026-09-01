package com.arooraa.aura.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Security-baseline knobs represented now so the next milestone's chat endpoint has a config
 * surface to read from day one, rather than hardcoding a limit inline later. Not consumed by any
 * code yet — no HTTP surface exists in A0/A1 (see AuraServiceApplication Javadoc).
 */
@ConfigurationProperties(prefix = "aura.safety")
public record AuraSafetyProperties(int maxInputChars, boolean rawPromptLoggingEnabled) {
}
