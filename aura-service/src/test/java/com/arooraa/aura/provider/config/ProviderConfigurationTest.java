package com.arooraa.aura.provider.config;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.RerankingProvider;
import com.arooraa.aura.provider.disabled.DisabledChatGenerationProvider;
import com.arooraa.aura.provider.disabled.DisabledEmbeddingProvider;
import com.arooraa.aura.provider.disabled.DisabledRerankingProvider;
import org.junit.jupiter.api.Test;
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
    void settingEnabledTrueWithNoRealAdapterLeavesNoBeanRatherThanFailingStartup() {
        // No real provider @Configuration exists yet in this milestone (by design — see
        // ProviderConfiguration's Javadoc). Flipping the flag alone must not crash context
        // loading; it just means nothing currently @Autowires this interface would be
        // satisfiable, which is fine because nothing does yet.
        contextRunner
                .withPropertyValues("aura.provider.chat.enabled=true")
                .run(context -> assertThat(context).doesNotHaveBean(ChatGenerationProvider.class));
    }
}
