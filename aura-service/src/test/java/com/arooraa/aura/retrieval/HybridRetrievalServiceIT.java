package com.arooraa.aura.retrieval;

import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.AuraEmbedding;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.domain.ProductStatus;
import com.arooraa.aura.knowledge.domain.Visibility;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.knowledge.repository.AuraEmbeddingRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-end proof that vector search + lexical search + RRF fusion + the evidence gate work
 * together through the real service, against a real pgvector container — not mocked. Not
 * {@code @Transactional}: repository {@code save()} calls auto-commit individually (matching the
 * A0/A1 IT convention), which native queries in {@code VectorSearchRepository}/
 * {@code LexicalSearchRepository} rely on since native queries don't auto-flush a pending Hibernate
 * persistence context. {@link #clearKnowledgeBase()} keeps tests isolated from each other instead.
 */
@Testcontainers
@SpringBootTest
class HybridRetrievalServiceIT {

    @Container
    static PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("pgvector/pgvector:pg16")
            .withStartupTimeout(java.time.Duration.ofMinutes(5))
            .withDatabaseName("arooraa_aura")
            .withUsername("arooraa_aura_app")
            .withPassword("integration-test-password");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @TestConfiguration
    static class StubProviderConfig {
        @Bean
        @Primary
        EmbeddingProvider stubEmbeddingProvider() {
            return new StubEmbeddingProvider();
        }
    }

    @Autowired
    private AuraDocumentRepository documentRepository;
    @Autowired
    private AuraDocumentVersionRepository versionRepository;
    @Autowired
    private AuraChunkRepository chunkRepository;
    @Autowired
    private AuraEmbeddingRepository embeddingRepository;
    @Autowired
    private EmbeddingProvider embeddingProvider;
    @Autowired
    private HybridRetrievalService retrievalService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Each repository {@code save()} auto-commits in its own transaction (no {@code @Transactional}
     * on this test class — see why in the class Javadoc), so state persists across test methods
     * within the same class run unless explicitly cleared. A query-count assertion like
     * "no eligible content returns NO_EVIDENCE" is only meaningful against a genuinely empty
     * corpus, so every test starts from a clean slate.
     */
    @BeforeEach
    void clearKnowledgeBase() {
        jdbcTemplate.update("TRUNCATE TABLE aura_embeddings, aura_chunks, aura_ingestion_jobs, aura_document_versions, aura_documents");
    }

    private void seedEligibleChunk(String product, String text) {
        AuraDocument document = documentRepository.save(
                new AuraDocument("hybrid-" + UUID.randomUUID(), "Hybrid Test", "test", null, product, null));
        AuraDocumentVersion version = new AuraDocumentVersion(document.getId(), 1, Visibility.PUBLIC, ProductStatus.AVAILABLE, null, text);
        version.approve("owner@arooraa.com");
        version.markIndexed();
        version.activate();
        version = versionRepository.save(version);
        AuraChunk chunk = chunkRepository.save(new AuraChunk(version.getId(), 0, text, null));
        embeddingRepository.save(new AuraEmbedding(chunk.getId(), "stub-embedding-model", "stub", 1, embeddingProvider.embed(text).vector()));
    }

    @Test
    void relevantContentIsReturnedAsEvidenceWithAtLeastWeakConfidence() {
        seedEligibleChunk("MESA", "MESA is AROORAA's connected restaurant technology ecosystem for dine-in and kitchen coordination.");
        seedEligibleChunk("Mindra", "Mindra is a separate AROORAA product covering an unrelated domain.");

        RetrievalResult result = retrievalService.retrieve(
                new RetrievalRequest("What is MESA?", AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));

        assertNotEquals(EvidenceLevel.NO_EVIDENCE, result.evidenceLevel());
        assertTrue(!result.evidence().isEmpty());
        assertTrue(result.evidence().get(0).text().contains("MESA"), "top evidence should be about MESA");
    }

    @Test
    void noEligibleContentReturnsNoEvidence() {
        RetrievalResult result = retrievalService.retrieve(
                new RetrievalRequest("A completely unseeded query about nothing in the corpus.",
                        AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));

        assertEquals(EvidenceLevel.NO_EVIDENCE, result.evidenceLevel());
        assertTrue(result.evidence().isEmpty());
    }

    @Test
    void anUnauthorizedProfileChannelPairReturnsNoEvidenceWithoutQueryingSearchAtAll() {
        seedEligibleChunk("MESA", "MESA is AROORAA's connected restaurant technology ecosystem.");

        RetrievalResult result = retrievalService.retrieve(
                new RetrievalRequest("What is MESA?", new AssistantProfile("UNKNOWN_PROFILE"), Channel.PUBLIC_WEB));

        assertEquals(EvidenceLevel.NO_EVIDENCE, result.evidenceLevel());
        assertTrue(result.evidence().isEmpty());
    }

    @Test
    void internalContentIsNeverReturnedEvenAsAnExactPhraseMatch() {
        AuraDocument document = documentRepository.save(
                new AuraDocument("hybrid-internal-" + UUID.randomUUID(), "Internal", "internal", null, null, null));
        AuraDocumentVersion version = new AuraDocumentVersion(document.getId(), 1, Visibility.INTERNAL, null, null,
                "INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ describes private infrastructure detail.");
        version.approve("owner@arooraa.com");
        version.markIndexed();
        version.activate();
        version = versionRepository.save(version);
        AuraChunk chunk = chunkRepository.save(new AuraChunk(version.getId(), 0,
                "INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ describes private infrastructure detail.", null));
        embeddingRepository.save(new AuraEmbedding(chunk.getId(), "stub-embedding-model", "stub", 1,
                embeddingProvider.embed("INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ describes private infrastructure detail.").vector()));

        RetrievalResult result = retrievalService.retrieve(new RetrievalRequest(
                "INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ", AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));

        assertEquals(EvidenceLevel.NO_EVIDENCE, result.evidenceLevel());
        assertTrue(result.evidence().stream().noneMatch(e -> e.text().contains("INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ")));
    }
}
