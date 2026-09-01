package com.arooraa.aura.provider.config;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.RerankingProvider;
import com.arooraa.aura.provider.disabled.DisabledChatGenerationProvider;
import com.arooraa.aura.provider.disabled.DisabledEmbeddingProvider;
import com.arooraa.aura.provider.disabled.DisabledRerankingProvider;
import com.arooraa.aura.provider.openai.OpenAiChatGenerationProvider;
import com.arooraa.aura.provider.openai.OpenAiEmbeddingProvider;
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
}
