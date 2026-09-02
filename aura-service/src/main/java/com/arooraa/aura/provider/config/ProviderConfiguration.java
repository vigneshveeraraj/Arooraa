package com.arooraa.aura.provider.config;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.RerankingProvider;
import com.arooraa.aura.provider.SpeechSynthesisProvider;
import com.arooraa.aura.provider.SpeechTranscriptionProvider;
import com.arooraa.aura.provider.disabled.DisabledChatGenerationProvider;
import com.arooraa.aura.provider.disabled.DisabledEmbeddingProvider;
import com.arooraa.aura.provider.disabled.DisabledRerankingProvider;
import com.arooraa.aura.provider.disabled.DisabledSpeechSynthesisProvider;
import com.arooraa.aura.provider.disabled.DisabledSpeechTranscriptionProvider;
import com.arooraa.aura.provider.openai.OpenAiChatGenerationProvider;
import com.arooraa.aura.provider.openai.OpenAiEmbeddingProvider;
import com.arooraa.aura.provider.openai.OpenAiSpeechSynthesisProvider;
import com.arooraa.aura.provider.openai.OpenAiSpeechTranscriptionProvider;
import com.arooraa.aura.voice.config.VoiceProperties;
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
 * application code (frozen architecture requirement). Two real adapters exist so far (embeddings
 * from A2, chat from A3), each behind its own condition; a second vendor is another conditional
 * {@code @Bean} here and nothing else. Every path degrades to the disabled provider rather than
 * failing startup: an application with no AI credentials configured must still run and stay
 * healthy.
 */
@Configuration
@EnableConfigurationProperties({ProviderProperties.class, VoiceProperties.class})
public class ProviderConfiguration {

    private static final Logger log = LoggerFactory.getLogger(ProviderConfiguration.class);

    /**
     * The real chat adapter (A3). Declared before the disabled/fallback beans below, because
     * bean-method order decides {@code @ConditionalOnMissingBean} evaluation inside one
     * {@code @Configuration} class.
     */
    @Bean
    @Conditional(OpenAiChatProviderCondition.class)
    public ChatGenerationProvider openAiChatGenerationProvider(RestClient.Builder builder,
                                                                 ProviderProperties properties,
                                                                 @Value("${OPENAI_API_KEY:}") String apiKey) {
        ProviderProperties.Chat chat = properties.chat();
        return new OpenAiChatGenerationProvider(withTimeout(builder, chat.timeoutSeconds()), apiKey, chat.model());
    }

    @Bean
    @ConditionalOnProperty(prefix = "aura.provider.chat", name = "enabled", havingValue = "false", matchIfMissing = true)
    public ChatGenerationProvider disabledChatGenerationProvider() {
        return new DisabledChatGenerationProvider();
    }

    /**
     * Same safety valve as the embedding fallback below: {@code enabled=true} with no usable
     * adapter (unknown provider name, or no key) must still start, and must still be healthy.
     */
    @Bean
    @ConditionalOnProperty(prefix = "aura.provider.chat", name = "enabled", havingValue = "true")
    @ConditionalOnMissingBean(ChatGenerationProvider.class)
    public ChatGenerationProvider chatProviderMisconfiguredFallback() {
        log.warn("aura.provider.chat.enabled=true but no real adapter could be wired "
                + "(unrecognized aura.provider.chat.provider, or OPENAI_API_KEY missing) — "
                + "falling back to the disabled provider so the application still starts.");
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
        return new OpenAiEmbeddingProvider(withTimeout(builder, embedding.timeoutSeconds()), apiKey,
                embedding.model(), embedding.dimensions());
    }

    /**
     * Transport configuration lives here rather than in the adapters, so a test can bind a mock
     * server to a builder and be certain no adapter constructor overwrites its request factory.
     */
    private RestClient.Builder withTimeout(RestClient.Builder builder, int timeoutSeconds) {
        Duration timeout = Duration.ofSeconds(timeoutSeconds);
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(timeout);
        requestFactory.setReadTimeout(timeout);
        return builder.requestFactory(requestFactory);
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

    // --- voice (A5) -------------------------------------------------------------------------

    /**
     * The real speech-to-text adapter. Wired only when all four of the voice master switch, the
     * transcription switch, a provider name with an adapter, and a key are present — see
     * {@link OpenAiTranscriptionProviderCondition}. Declared before its fallback below, because
     * bean-method order decides {@code @ConditionalOnMissingBean} evaluation inside one
     * {@code @Configuration} class.
     */
    @Bean
    @Conditional(OpenAiTranscriptionProviderCondition.class)
    public SpeechTranscriptionProvider openAiSpeechTranscriptionProvider(RestClient.Builder builder,
                                                                          VoiceProperties voice,
                                                                          @Value("${OPENAI_API_KEY:}") String apiKey) {
        VoiceProperties.Transcription transcription = voice.transcription();
        return new OpenAiSpeechTranscriptionProvider(
                withTimeout(builder, transcription.timeoutSeconds()), apiKey, transcription.model());
    }

    /**
     * Covers every other case in one bean rather than the two the chat and embedding pairs use:
     * voice off, transcription off, an unrecognized provider name, or no key. The warning fires
     * only for the misconfiguration — an operator who simply has voice off should not be told
     * anything, and one who asked for voice and did not get it should not have to guess why.
     */
    @Bean
    @ConditionalOnMissingBean(SpeechTranscriptionProvider.class)
    public SpeechTranscriptionProvider disabledSpeechTranscriptionProvider(VoiceProperties voice) {
        if (voice.transcriptionEnabled()) {
            log.warn("aura.voice.transcription is enabled but no real adapter could be wired "
                    + "(unrecognized aura.voice.transcription.provider, or OPENAI_API_KEY missing) — "
                    + "falling back to the disabled provider so the application still starts.");
        }
        return new DisabledSpeechTranscriptionProvider();
    }

    @Bean
    @Conditional(OpenAiSynthesisProviderCondition.class)
    public SpeechSynthesisProvider openAiSpeechSynthesisProvider(RestClient.Builder builder,
                                                                   VoiceProperties voice,
                                                                   @Value("${OPENAI_API_KEY:}") String apiKey) {
        VoiceProperties.Synthesis synthesis = voice.synthesis();
        return new OpenAiSpeechSynthesisProvider(
                withTimeout(builder, synthesis.timeoutSeconds()), apiKey, synthesis.model());
    }

    @Bean
    @ConditionalOnMissingBean(SpeechSynthesisProvider.class)
    public SpeechSynthesisProvider disabledSpeechSynthesisProvider(VoiceProperties voice) {
        if (voice.synthesisEnabled()) {
            log.warn("aura.voice.synthesis is enabled but no real adapter could be wired "
                    + "(unrecognized aura.voice.synthesis.provider, or OPENAI_API_KEY missing) — "
                    + "falling back to the disabled provider so the application still starts.");
        }
        return new DisabledSpeechSynthesisProvider();
    }

    @Bean
    @ConditionalOnProperty(prefix = "aura.provider.reranking", name = "enabled", havingValue = "false", matchIfMissing = true)
    public RerankingProvider disabledRerankingProvider() {
        return new DisabledRerankingProvider();
    }
}
