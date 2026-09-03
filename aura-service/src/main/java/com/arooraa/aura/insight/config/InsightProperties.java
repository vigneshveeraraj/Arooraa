package com.arooraa.aura.insight.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Backed by {@code aura.insights.*}, and the two switches here default differently on purpose.
 *
 * <p>{@code enabled} — recording — defaults to <b>true</b>, which is the opposite of every other
 * switch in this service. Everything else that defaults off can spend money, reach outside, or
 * expose a surface; recording does none of those. It writes rows to our own database that contain
 * no prompts, no answers, no secrets and nothing identifying a person, and a service that improves
 * itself only when somebody remembers to turn on the measurement will not improve itself.
 *
 * <p>{@code apiEnabled} — reading — defaults to <b>false</b>, because exposing is a different
 * decision from collecting. Even on, it needs a token; see {@code AuraInsightsController}.
 */
@ConfigurationProperties(prefix = "aura.insights")
public record InsightProperties(boolean enabled, boolean apiEnabled, int maxGapsReturned) {

    public InsightProperties {
        if (maxGapsReturned <= 0) maxGapsReturned = 50;
    }
}
