package com.arooraa.aura.provider.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * True only when {@code aura.provider.embedding.enabled=true}, {@code aura.provider.embedding.provider=openai},
 * AND a non-blank {@code OPENAI_API_KEY} is present. A plain {@link Condition} rather than
 * {@code @ConditionalOnExpression} SpEL string-splicing, so an API key value can never end up
 * embedded in an expression string. When this doesn't match (including "enabled=true but no
 * key"), {@link ProviderConfiguration}'s fallback bean provides the production-safe disabled
 * default instead of leaving the application unable to start.
 */
class OpenAiEmbeddingProviderCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment env = context.getEnvironment();
        boolean enabled = env.getProperty("aura.provider.embedding.enabled", Boolean.class, false);
        String provider = env.getProperty("aura.provider.embedding.provider", "");
        String apiKey = env.getProperty("OPENAI_API_KEY", "");
        return enabled && "openai".equalsIgnoreCase(provider) && !apiKey.isBlank();
    }
}
