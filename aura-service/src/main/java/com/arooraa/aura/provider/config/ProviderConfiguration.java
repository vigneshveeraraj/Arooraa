package com.arooraa.aura.provider.config;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.RerankingProvider;
import com.arooraa.aura.provider.disabled.DisabledChatGenerationProvider;
import com.arooraa.aura.provider.disabled.DisabledEmbeddingProvider;
import com.arooraa.aura.provider.disabled.DisabledRerankingProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Wires the provider-neutral interfaces to their real-or-disabled implementation purely from
 * {@code aura.provider.*} config — no {@code if (provider == "openai")} branching anywhere in
 * application code (frozen architecture requirement). Only the disabled/production-safe defaults
 * ship in this milestone; a real provider adapter is a later, separate {@code @Configuration}
 * conditioned on {@code havingValue = "true"} for the matching property, added without touching
 * this class or any consumer of these interfaces.
 */
@Configuration
@EnableConfigurationProperties(ProviderProperties.class)
public class ProviderConfiguration {

    @Bean
    @ConditionalOnProperty(prefix = "aura.provider.chat", name = "enabled", havingValue = "false", matchIfMissing = true)
    public ChatGenerationProvider disabledChatGenerationProvider() {
        return new DisabledChatGenerationProvider();
    }

    @Bean
    @ConditionalOnProperty(prefix = "aura.provider.embedding", name = "enabled", havingValue = "false", matchIfMissing = true)
    public EmbeddingProvider disabledEmbeddingProvider() {
        return new DisabledEmbeddingProvider();
    }

    @Bean
    @ConditionalOnProperty(prefix = "aura.provider.reranking", name = "enabled", havingValue = "false", matchIfMissing = true)
    public RerankingProvider disabledRerankingProvider() {
        return new DisabledRerankingProvider();
    }
}
