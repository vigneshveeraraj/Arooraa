package com.arooraa.aura.bootstrap;

import com.arooraa.aura.ingestion.IngestionService;
import com.arooraa.aura.knowledge.imports.KnowledgeActivationService;
import com.arooraa.aura.knowledge.imports.KnowledgeApprovalService;
import com.arooraa.aura.knowledge.imports.KnowledgeDocumentParser;
import com.arooraa.aura.knowledge.imports.KnowledgeImportService;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.EmbeddingResult;
import com.arooraa.aura.provider.config.ProviderProperties;
import com.arooraa.aura.provider.disabled.DisabledEmbeddingProvider;
import org.junit.jupiter.api.Test;
import org.springframework.context.ConfigurableApplicationContext;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * The preconditions, checked before a single document is touched.
 *
 * <p>Failing here rather than partway through matters: without these checks the pipeline would
 * report success document by document while every ingestion job failed, leaving a database full of
 * approved-but-unsearchable content and an operator with no idea why Aura cannot answer anything.
 */
class PublicKnowledgeBootstrapTest {

    private final KnowledgeImportService importService = mock(KnowledgeImportService.class);
    private final KnowledgeApprovalService approvalService = mock(KnowledgeApprovalService.class);
    private final IngestionService ingestionService = mock(IngestionService.class);
    private final KnowledgeActivationService activationService = mock(KnowledgeActivationService.class);
    private final AuraDocumentVersionRepository versionRepository = mock(AuraDocumentVersionRepository.class);

    private PublicKnowledgeBootstrap bootstrapWith(EmbeddingProvider provider, int configuredDimensions,
                                                    int generation) {
        ProviderProperties providerProperties = new ProviderProperties(
                new ProviderProperties.Chat(false, "openai", "gpt-4o-mini", 30),
                new ProviderProperties.Embedding(true, "openai", "text-embedding-3-small",
                        configuredDimensions, 30, generation),
                new ProviderProperties.Reranking(false, null, 30));
        return new PublicKnowledgeBootstrap(new KnowledgeDocumentParser(), importService, approvalService,
                ingestionService, activationService, versionRepository, provider, providerProperties,
                new BootstrapProperties(true, "knowledge-seed", "test@arooraa.com", false),
                mock(ConfigurableApplicationContext.class));
    }

    /** Fixed-size fake so the dimension check has something concrete to disagree with. */
    private static EmbeddingProvider providerWithDimensions(int dimensions) {
        return new EmbeddingProvider() {
            @Override
            public boolean isEnabled() {
                return true;
            }

            @Override
            public int dimensions() {
                return dimensions;
            }

            @Override
            public EmbeddingResult embed(String text) {
                return new EmbeddingResult(new float[dimensions], "fake-model", "fake");
            }
        };
    }

    @Test
    void bootstrapRefusesToRunWithNoEmbeddingProviderEnabled() {
        PublicKnowledgeBootstrap bootstrap = bootstrapWith(new DisabledEmbeddingProvider(), 1536, 2);

        IllegalStateException e = assertThrows(IllegalStateException.class, bootstrap::bootstrap);

        assertTrue(e.getMessage().contains("aura.provider.embedding.enabled"),
                "the message should name the setting to fix: " + e.getMessage());
        verifyNoInteractions(importService, approvalService, ingestionService, activationService);
    }

    @Test
    void aDimensionMismatchFailsBeforeAnythingIsWritten() {
        // Wrong-width vectors are worse than none: they persist, and retrieval cannot compare them.
        PublicKnowledgeBootstrap bootstrap = bootstrapWith(providerWithDimensions(768), 1536, 2);

        IllegalStateException e = assertThrows(IllegalStateException.class, bootstrap::bootstrap);

        assertTrue(e.getMessage().contains("768") && e.getMessage().contains("1536"), e.getMessage());
        verifyNoInteractions(importService, ingestionService);
    }

    @Test
    void anInvalidEmbeddingGenerationFailsClearly() {
        PublicKnowledgeBootstrap bootstrap = bootstrapWith(providerWithDimensions(1536), 1536, 0);

        IllegalStateException e = assertThrows(IllegalStateException.class, bootstrap::bootstrap);

        assertTrue(e.getMessage().contains("generation"), e.getMessage());
        verifyNoInteractions(importService, ingestionService);
    }

    @Test
    void aMissingSourceDirectoryFailsWithAnActionableMessage() {
        ProviderProperties providerProperties = new ProviderProperties(
                new ProviderProperties.Chat(false, "openai", "gpt-4o-mini", 30),
                new ProviderProperties.Embedding(true, "openai", "text-embedding-3-small", 1536, 30, 2),
                new ProviderProperties.Reranking(false, null, 30));
        PublicKnowledgeBootstrap bootstrap = new PublicKnowledgeBootstrap(new KnowledgeDocumentParser(),
                importService, approvalService, ingestionService, activationService, versionRepository,
                providerWithDimensions(1536), providerProperties,
                new BootstrapProperties(true, "no-such-directory", "test@arooraa.com", false),
                mock(ConfigurableApplicationContext.class));

        IllegalStateException e = assertThrows(IllegalStateException.class, bootstrap::bootstrap);

        assertTrue(e.getMessage().contains("aura.bootstrap.source-directory"), e.getMessage());
        verifyNoInteractions(importService);
    }
}
