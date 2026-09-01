package com.arooraa.aura.provider.config;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.RerankingProvider;
import com.arooraa.aura.provider.disabled.DisabledChatGenerationProvider;
import com.arooraa.aura.provider.disabled.DisabledEmbeddingProvider;
import com.arooraa.aura.provider.disabled.DisabledRerankingProvider;
import com.arooraa.aura.provider.openai.OpenAiEmbeddingProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

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

    private static final Logger log = LoggerFactory.getLogger(ProviderConfiguration.class);

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

    /**
     * The one real provider adapter this milestone ships (A2). Config-driven selection, not a
     * business-code branch: this bean only exists when {@code aura.provider.embedding.provider}
     * is "openai" (see {@link OpenAiEmbeddingProviderCondition}) — a later milestone adding a
     * second real adapter is another conditional {@code @Bean} here, never a change to this one
     * or to any consumer of {@link EmbeddingProvider}. Declared before the fallback bean below —
     * bean-method declaration order matters for {@code @ConditionalOnMissingBean} evaluation
     * within one {@code @Configuration} class.
     */
    @Bean
    @Conditional(OpenAiEmbeddingProviderCondition.class)
    public EmbeddingProvider openAiEmbeddingProvider(RestClient.Builder builder, ProviderProperties properties,
                                                       @Value("${OPENAI_API_KEY:}") String apiKey) {
        ProviderProperties.Embedding embedding = properties.embedding();

        Duration timeout = Duration.ofSeconds(embedding.timeoutSeconds());
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(timeout);
        requestFactory.setReadTimeout(timeout);
        builder.requestFactory(requestFactory);

        return new OpenAiEmbeddingProvider(builder, apiKey, embedding.model(), embedding.dimensions());
    }

    /**
     * Covers the gap {@link OpenAiEmbeddingProviderCondition} deliberately leaves open:
     * {@code enabled=true} but no real adapter could be wired (unknown provider name, or no API
     * key configured). Without this, the application would fail to start on that misconfiguration
     * rather than degrading safely (frozen requirement: "when no key/provider is configured, Aura
     * must still start normally").
     */
    @Bean
    @ConditionalOnProperty(prefix = "aura.provider.embedding", name = "enabled", havingValue = "true")
    @ConditionalOnMissingBean(EmbeddingProvider.class)
    public EmbeddingProvider embeddingProviderMisconfiguredFallback() {
        log.warn("aura.provider.embedding.enabled=true but no real adapter could be wired "
                + "(unrecognized aura.provider.embedding.provider, or OPENAI_API_KEY missing) — "
                + "falling back to the disabled provider so the application still starts.");
        return new DisabledEmbeddingProvider();
    }

    @Bean
    @ConditionalOnProperty(prefix = "aura.provider.reranking", name = "enabled", havingValue = "false", matchIfMissing = true)
    public RerankingProvider disabledRerankingProvider() {
        return new DisabledRerankingProvider();
    }
}
