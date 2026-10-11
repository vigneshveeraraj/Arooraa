package com.arooraa.leads.capture.conversation.model;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import tools.jackson.databind.json.JsonMapper;

import java.time.Clock;
import java.time.Duration;
import java.util.Locale;

/**
 * Picks the reply classifier from configuration. Misconfiguration never stops the app: an
 * unknown provider logs a warning and falls back to the rules-only classifier.
 */
@Configuration
public class LeadAssistantModelConfiguration {

    private static final Logger log = LoggerFactory.getLogger(LeadAssistantModelConfiguration.class);

    private ModelReplyClassifier classifier;

    @Bean
    public LeadAssistantModelProperties leadAssistantModelProperties(
            @Value("${arooraa.lead-assistant.model.provider:none}") String provider,
            @Value("${arooraa.lead-assistant.model.base-url:http://localhost:11434}") String baseUrl,
            @Value("${arooraa.lead-assistant.model.name:qwen3-vl:4b-instruct}") String model,
            @Value("${arooraa.lead-assistant.model.fallback-name:}") String fallbackModel,
            @Value("${arooraa.lead-assistant.model.connect-timeout-ms:1000}") long connectTimeoutMs,
            @Value("${arooraa.lead-assistant.model.timeout-ms:4000}") long timeoutMs,
            @Value("${arooraa.lead-assistant.model.keep-alive:30m}") String keepAlive,
            @Value("${arooraa.lead-assistant.model.failure-threshold:3}") int failureThreshold,
            @Value("${arooraa.lead-assistant.model.cooldown-seconds:60}") long cooldownSeconds,
            @Value("${arooraa.lead-assistant.model.warm-up-on-startup:true}") boolean warmUpOnStartup) {
        return new LeadAssistantModelProperties(provider.trim().toLowerCase(Locale.ROOT), baseUrl, model, fallbackModel,
                Duration.ofMillis(connectTimeoutMs), Duration.ofMillis(timeoutMs), keepAlive,
                Math.max(1, failureThreshold), Duration.ofSeconds(cooldownSeconds), warmUpOnStartup);
    }

    @Bean
    public ModelReplyClassifier modelReplyClassifier(LeadAssistantModelProperties properties, JsonMapper jsonMapper) {
        classifier = switch (properties.provider()) {
            case "ollama" -> new OllamaReplyClassifier(properties, jsonMapper, Clock.systemUTC());
            case "none", "" -> new DisabledModelReplyClassifier();
            default -> {
                log.warn("lead-assistant unknown model provider; using rules only");
                yield new DisabledModelReplyClassifier();
            }
        };
        log.info("lead-assistant reply classifier={}", classifier.describe());
        return classifier;
    }

    /** Off the startup path: the app is ready whether or not the model ever loads. */
    @EventListener(ApplicationReadyEvent.class)
    public void warmUp(ApplicationReadyEvent event) {
        LeadAssistantModelProperties properties = event.getApplicationContext().getBean(LeadAssistantModelProperties.class);
        if (classifier instanceof OllamaReplyClassifier ollama && properties.warmUpOnStartup()) {
            Thread.ofVirtual().name("lead-assistant-warm-up").start(ollama::warmUp);
        }
    }
}
