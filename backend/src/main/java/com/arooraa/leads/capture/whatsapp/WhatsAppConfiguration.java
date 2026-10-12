package com.arooraa.leads.capture.whatsapp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.json.JsonMapper;

/**
 * Validates {@code arooraa.whatsapp.*} at startup (fail closed, only for the switches that are on)
 * and wires the real Cloud API gateway only when outbound sending is enabled.
 */
@Configuration
@EnableConfigurationProperties(WhatsAppProperties.class)
public class WhatsAppConfiguration {

    public WhatsAppConfiguration(WhatsAppProperties properties,
            @Value("${arooraa.lead-assistant.model.provider:none}") String modelProvider) {
        properties.validate();
        if (properties.enabled() && !"none".equalsIgnoreCase(modelProvider.strip())) {
            throw new IllegalStateException("WhatsApp requires arooraa.lead-assistant.model.provider=none; "
                    + "network classification cannot run inside a conversation transaction");
        }
    }

    @Bean
    @ConditionalOnProperty(prefix = "arooraa.whatsapp", name = "outbound-enabled", havingValue = "true")
    public WhatsAppGateway whatsAppGateway(WhatsAppProperties properties, JsonMapper jsonMapper) {
        return new CloudApiWhatsAppGateway(properties, jsonMapper);
    }
}
