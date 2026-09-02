package com.arooraa.aura.provider.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * Four requirements, all of which must hold before a real transcription adapter is wired: the
 * voice master switch, the transcription switch, a provider name this codebase has an adapter
 * for, and a key. A plain {@link Condition} rather than SpEL for the same reason as the chat and
 * embedding conditions — no key value is ever spliced into an expression string — and a missing
 * key degrades to the disabled provider rather than preventing startup.
 */
class OpenAiTranscriptionProviderCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment env = context.getEnvironment();
        boolean voiceEnabled = env.getProperty("aura.voice.enabled", Boolean.class, false);
        boolean enabled = env.getProperty("aura.voice.transcription.enabled", Boolean.class, false);
        String provider = env.getProperty("aura.voice.transcription.provider", "");
        String apiKey = env.getProperty("OPENAI_API_KEY", "");
        return voiceEnabled && enabled && "openai".equalsIgnoreCase(provider) && !apiKey.isBlank();
    }
}
