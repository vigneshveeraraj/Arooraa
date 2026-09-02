package com.arooraa.aura.provider.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;

/** The synthesis counterpart of {@link OpenAiTranscriptionProviderCondition}, on the same terms. */
class OpenAiSynthesisProviderCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment env = context.getEnvironment();
        boolean voiceEnabled = env.getProperty("aura.voice.enabled", Boolean.class, false);
        boolean enabled = env.getProperty("aura.voice.synthesis.enabled", Boolean.class, false);
        String provider = env.getProperty("aura.voice.synthesis.provider", "");
        String apiKey = env.getProperty("OPENAI_API_KEY", "");
        return voiceEnabled && enabled && "openai".equalsIgnoreCase(provider) && !apiKey.isBlank();
    }
}
