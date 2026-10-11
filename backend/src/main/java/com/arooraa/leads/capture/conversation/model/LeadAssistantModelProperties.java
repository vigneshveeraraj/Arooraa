package com.arooraa.leads.capture.conversation.model;

import java.time.Duration;

/**
 * arooraa.lead-assistant.model.* — see application.yml. {@code provider} is "none" (default) or
 * "ollama"; nothing else is accepted, and no setting here can turn on a paid or remote service.
 */
public record LeadAssistantModelProperties(
        String provider,
        String baseUrl,
        String model,
        String fallbackModel,
        Duration connectTimeout,
        Duration timeout,
        String keepAlive,
        int failureThreshold,
        Duration cooldown,
        boolean warmUpOnStartup
) {
}
