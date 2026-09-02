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
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.restclient.autoconfigure.RestClientAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Proves provider selection is purely configuration-driven and production-safe by default —
 * no Testcontainers/DB needed, a plain bean-graph check.
 */
class ProviderConfigurationTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(ProviderConfiguration.class);

    @Test
    void withNoConfigurationAllThreeProvidersAreTheDisabledProductionSafeDefault() {
        contextRunner.run(context -> {
            assertThat(context).hasSingleBean(ChatGenerationProvider.class);
            assertThat(context).hasSingleBean(EmbeddingProvider.class);
            assertThat(context).hasSingleBean(RerankingProvider.class);

            assertThat(context.getBean(ChatGenerationProvider.class)).isInstanceOf(DisabledChatGenerationProvider.class);
            assertThat(context.getBean(EmbeddingProvider.class)).isInstanceOf(DisabledEmbeddingProvider.class);
            assertThat(context.getBean(RerankingProvider.class)).isInstanceOf(DisabledRerankingProvider.class);

            assertThat(context.getBean(ChatGenerationProvider.class).isEnabled()).isFalse();
            assertThat(context.getBean(EmbeddingProvider.class).isEnabled()).isFalse();
            assertThat(context.getBean(RerankingProvider.class).isEnabled()).isFalse();
        });
    }

    @Test
    void explicitlyDisabledIsEquivalentToUnset() {
        contextRunner
                .withPropertyValues(
                        "aura.provider.chat.enabled=false",
                        "aura.provider.embedding.enabled=false",
                        "aura.provider.reranking.enabled=false")
                .run(context -> {
                    assertThat(context.getBean(ChatGenerationProvider.class)).isInstanceOf(DisabledChatGenerationProvider.class);
                    assertThat(context.getBean(EmbeddingProvider.class)).isInstanceOf(DisabledEmbeddingProvider.class);
                    assertThat(context.getBean(RerankingProvider.class)).isInstanceOf(DisabledRerankingProvider.class);
                });
    }

    @Test
    void chatEnabledWithNoOpenAiKeyFallsBackToTheDisabledProviderInsteadOfFailingStartup() {
        contextRunner
                .withPropertyValues("aura.provider.chat.enabled=true", "aura.provider.chat.provider=openai")
                .run(context -> {
                    assertThat(context).hasSingleBean(ChatGenerationProvider.class);
                    assertThat(context.getBean(ChatGenerationProvider.class)).isInstanceOf(DisabledChatGenerationProvider.class);
                    assertThat(context.getBean(ChatGenerationProvider.class).isEnabled()).isFalse();
                });
    }

    @Test
    void chatEnabledWithAnUnrecognizedProviderNameFallsBackToTheDisabledProvider() {
        contextRunner
                .withSystemProperties("OPENAI_API_KEY=sk-test-key")
                .withPropertyValues("aura.provider.chat.enabled=true", "aura.provider.chat.provider=unknown-vendor")
                .run(context -> assertThat(context.getBean(ChatGenerationProvider.class)).isInstanceOf(DisabledChatGenerationProvider.class));
    }

    @Test
    void chatEnabledWithOpenAiProviderAndApiKeyWiresTheRealAdapter() {
        contextRunner
                .withConfiguration(AutoConfigurations.of(RestClientAutoConfiguration.class))
                .withSystemProperties("OPENAI_API_KEY=sk-test-key")
                .withPropertyValues(
                        "aura.provider.chat.enabled=true",
                        "aura.provider.chat.provider=openai",
                        "aura.provider.chat.model=gpt-4o-mini")
                .run(context -> {
                    assertThat(context).hasSingleBean(ChatGenerationProvider.class);
                    assertThat(context.getBean(ChatGenerationProvider.class)).isInstanceOf(OpenAiChatGenerationProvider.class);
                    assertThat(context.getBean(ChatGenerationProvider.class).isEnabled()).isTrue();
                });
    }

    @Test
    void embeddingEnabledWithNoOpenAiKeyFallsBackToTheDisabledProviderInsteadOfFailingStartup() {
        contextRunner
                .withPropertyValues("aura.provider.embedding.enabled=true", "aura.provider.embedding.provider=openai")
                .run(context -> {
                    assertThat(context).hasSingleBean(EmbeddingProvider.class);
                    assertThat(context.getBean(EmbeddingProvider.class)).isInstanceOf(DisabledEmbeddingProvider.class);
                });
    }

    @Test
    void embeddingEnabledWithAnUnrecognizedProviderNameFallsBackToTheDisabledProvider() {
        contextRunner
                .withSystemProperties("OPENAI_API_KEY=sk-test-key")
                .withPropertyValues("aura.provider.embedding.enabled=true", "aura.provider.embedding.provider=unknown-vendor")
                .run(context -> assertThat(context.getBean(EmbeddingProvider.class)).isInstanceOf(DisabledEmbeddingProvider.class));
    }

    @Test
    void embeddingEnabledWithOpenAiProviderAndApiKeyWiresTheRealAdapter() {
        contextRunner
                .withConfiguration(AutoConfigurations.of(RestClientAutoConfiguration.class))
                .withSystemProperties("OPENAI_API_KEY=sk-test-key")
                .withPropertyValues(
                        "aura.provider.embedding.enabled=true",
                        "aura.provider.embedding.provider=openai",
                        "aura.provider.embedding.model=text-embedding-3-small",
                        "aura.provider.embedding.dimensions=1536")
                .run(context -> {
                    assertThat(context).hasSingleBean(EmbeddingProvider.class);
                    assertThat(context.getBean(EmbeddingProvider.class)).isInstanceOf(OpenAiEmbeddingProvider.class);
                    assertThat(context.getBean(EmbeddingProvider.class).isEnabled()).isTrue();
                    assertThat(context.getBean(EmbeddingProvider.class).dimensions()).isEqualTo(1536);
                });
    }

    // --- voice (A5) ---------------------------------------------------------------------------

    @Test
    void withNoConfigurationBothVoiceProvidersAreDisabledToo() {
        contextRunner.run(context -> {
            assertThat(context).hasSingleBean(SpeechTranscriptionProvider.class);
            assertThat(context).hasSingleBean(SpeechSynthesisProvider.class);
            assertThat(context.getBean(SpeechTranscriptionProvider.class))
                    .isInstanceOf(DisabledSpeechTranscriptionProvider.class);
            assertThat(context.getBean(SpeechSynthesisProvider.class))
                    .isInstanceOf(DisabledSpeechSynthesisProvider.class);
            assertThat(context.getBean(SpeechTranscriptionProvider.class).isEnabled()).isFalse();
            assertThat(context.getBean(SpeechSynthesisProvider.class).isEnabled()).isFalse();
        });
    }

    @Test
    void theVoiceMasterSwitchOverridesTheIndividualOnes() {
        // Both halves asked for, a real provider named, a key present — and voice itself off. One
        // variable has to be able to kill all of it, which is the whole reason the master switch
        // exists rather than two independent flags.
        contextRunner
                .withConfiguration(AutoConfigurations.of(RestClientAutoConfiguration.class))
                .withSystemProperties("OPENAI_API_KEY=sk-test-key")
                .withPropertyValues(
                        "aura.voice.enabled=false",
                        "aura.voice.transcription.enabled=true",
                        "aura.voice.transcription.provider=openai",
                        "aura.voice.synthesis.enabled=true",
                        "aura.voice.synthesis.provider=openai")
                .run(context -> {
                    assertThat(context.getBean(SpeechTranscriptionProvider.class))
                            .isInstanceOf(DisabledSpeechTranscriptionProvider.class);
                    assertThat(context.getBean(SpeechSynthesisProvider.class))
                            .isInstanceOf(DisabledSpeechSynthesisProvider.class);
                });
    }

    @Test
    void voiceEnabledWithNoOpenAiKeyFallsBackToTheDisabledProvidersInsteadOfFailingStartup() {
        contextRunner
                .withPropertyValues(
                        "aura.voice.enabled=true",
                        "aura.voice.transcription.enabled=true",
                        "aura.voice.transcription.provider=openai",
                        "aura.voice.synthesis.enabled=true",
                        "aura.voice.synthesis.provider=openai")
                .run(context -> {
                    assertThat(context.getBean(SpeechTranscriptionProvider.class))
                            .isInstanceOf(DisabledSpeechTranscriptionProvider.class);
                    assertThat(context.getBean(SpeechSynthesisProvider.class))
                            .isInstanceOf(DisabledSpeechSynthesisProvider.class);
                });
    }

    @Test
    void voiceEnabledWithAnUnrecognizedProviderNameFallsBackToTheDisabledProviders() {
        contextRunner
                .withSystemProperties("OPENAI_API_KEY=sk-test-key")
                .withPropertyValues(
                        "aura.voice.enabled=true",
                        "aura.voice.transcription.enabled=true",
                        "aura.voice.transcription.provider=unknown-vendor",
                        "aura.voice.synthesis.enabled=true",
                        "aura.voice.synthesis.provider=unknown-vendor")
                .run(context -> {
                    assertThat(context.getBean(SpeechTranscriptionProvider.class))
                            .isInstanceOf(DisabledSpeechTranscriptionProvider.class);
                    assertThat(context.getBean(SpeechSynthesisProvider.class))
                            .isInstanceOf(DisabledSpeechSynthesisProvider.class);
                });
    }

    @Test
    void eachHalfOfVoiceCanBeEnabledWithoutTheOther() {
        // Listening and speaking are separate costs and separate decisions. A deployment that wants
        // to take spoken questions but answer in text only must be able to say exactly that.
        contextRunner
                .withConfiguration(AutoConfigurations.of(RestClientAutoConfiguration.class))
                .withSystemProperties("OPENAI_API_KEY=sk-test-key")
                .withPropertyValues(
                        "aura.voice.enabled=true",
                        "aura.voice.transcription.enabled=true",
                        "aura.voice.transcription.provider=openai",
                        "aura.voice.synthesis.enabled=false")
                .run(context -> {
                    assertThat(context.getBean(SpeechTranscriptionProvider.class))
                            .isInstanceOf(OpenAiSpeechTranscriptionProvider.class);
                    assertThat(context.getBean(SpeechSynthesisProvider.class))
                            .isInstanceOf(DisabledSpeechSynthesisProvider.class);
                });
    }

    @Test
    void voiceEnabledWithOpenAiProvidersAndApiKeyWiresBothRealAdapters() {
        contextRunner
                .withConfiguration(AutoConfigurations.of(RestClientAutoConfiguration.class))
                .withSystemProperties("OPENAI_API_KEY=sk-test-key")
                .withPropertyValues(
                        "aura.voice.enabled=true",
                        "aura.voice.transcription.enabled=true",
                        "aura.voice.transcription.provider=openai",
                        "aura.voice.transcription.model=whisper-1",
                        "aura.voice.synthesis.enabled=true",
                        "aura.voice.synthesis.provider=openai",
                        "aura.voice.synthesis.model=gpt-4o-mini-tts")
                .run(context -> {
                    assertThat(context).hasSingleBean(SpeechTranscriptionProvider.class);
                    assertThat(context).hasSingleBean(SpeechSynthesisProvider.class);
                    assertThat(context.getBean(SpeechTranscriptionProvider.class))
                            .isInstanceOf(OpenAiSpeechTranscriptionProvider.class);
                    assertThat(context.getBean(SpeechSynthesisProvider.class))
                            .isInstanceOf(OpenAiSpeechSynthesisProvider.class);
                    assertThat(context.getBean(SpeechTranscriptionProvider.class).isEnabled()).isTrue();
                    assertThat(context.getBean(SpeechSynthesisProvider.class).isEnabled()).isTrue();
                });
    }
}
