package com.arooraa.aura.provider.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * The chat counterpart of {@link OpenAiEmbeddingProviderCondition}, with the same three
 * requirements and the same reasoning: a plain {@link Condition} rather than SpEL, so no API key
 * value is ever spliced into an expression string, and a missing key degrades to the disabled
 * provider instead of preventing startup.
 */
class OpenAiChatProviderCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment env = context.getEnvironment();
        boolean enabled = env.getProperty("aura.provider.chat.enabled", Boolean.class, false);
        String provider = env.getProperty("aura.provider.chat.provider", "");
        String apiKey = env.getProperty("OPENAI_API_KEY", "");
        return enabled && "openai".equalsIgnoreCase(provider) && !apiKey.isBlank();
    }
}
