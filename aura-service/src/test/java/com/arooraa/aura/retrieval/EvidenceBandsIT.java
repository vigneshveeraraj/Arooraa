package com.arooraa.aura.retrieval;

import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.AuraEmbedding;
import com.arooraa.aura.knowledge.domain.Visibility;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.knowledge.repository.AuraEmbeddingRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.FixedVectorEmbeddingProvider;
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
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Proves the evidence bands end to end against a real pgvector similarity search, using exactly
 * controlled cosine similarities (see {@link FixedVectorEmbeddingProvider}). Secretless — no real
 * provider involved, so this runs in every normal build.
 *
 * <p>Every case here seeds a corpus where the chunk under test is the <em>only</em> candidate, so
 * it is always RRF rank 1 with a perfect normalized fusion score. Anything other than STRONG is
 * therefore direct proof that rank no longer drives confidence.
 */
@Testcontainers
@SpringBootTest
class EvidenceBandsIT {

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

    static final FixedVectorEmbeddingProvider FIXED_VECTORS = new FixedVectorEmbeddingProvider();

    @TestConfiguration
    static class FixedVectorConfig {
        @Bean
        @Primary
        EmbeddingProvider fixedVectorEmbeddingProvider() {
            return FIXED_VECTORS;
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
    private HybridRetrievalService retrievalService;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void clearKnowledgeBase() {
        jdbcTemplate.update("TRUNCATE TABLE aura_embeddings, aura_chunks, aura_ingestion_jobs, aura_document_versions, aura_documents");
    }

    /** Seeds one retrievable chunk whose vector sits at angle 0, so a query registered with cosine c has similarity exactly c. */
    private void seedChunkAtOrigin(String chunkText) {
        FIXED_VECTORS.register(chunkText, FixedVectorEmbeddingProvider.unitVectorAtAngle(0));

        AuraDocument document = documentRepository.save(
                new AuraDocument("bands-" + UUID.randomUUID(), "Bands Test", "test", null, null, null));
        AuraDocumentVersion version = new AuraDocumentVersion(document.getId(), 1, Visibility.PUBLIC, null, null, chunkText);
        version.approve("owner@arooraa.com");
        version.markIndexed();
        version.activate();
        version = versionRepository.save(version);
        AuraChunk chunk = chunkRepository.save(new AuraChunk(version.getId(), 0, chunkText, null));
        embeddingRepository.save(new AuraEmbedding(chunk.getId(), "fixed-vector-test-model", "fixed-vector-test", 1,
                FixedVectorEmbeddingProvider.unitVectorAtAngle(0)));
    }

    private RetrievalResult retrieveWithSimilarity(String query, double cosine) {
        FIXED_VECTORS.register(query, FixedVectorEmbeddingProvider.unitVectorWithSimilarity(cosine));
        return retrievalService.retrieve(
                new RetrievalRequest(query, AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));
    }

    @Test
    void anIrrelevantRankOneResultProducesNoEvidence() {
        seedChunkAtOrigin("MESA is AROORAA's connected restaurant technology ecosystem for kitchen coordination.");

        // No shared vocabulary, low absolute similarity — but it is still the only candidate, so
        // RRF ranks it first with a perfect fused score.
        RetrievalResult result = retrieveWithSimilarity("Who won the football World Cup?", 0.10);

        assertEquals(EvidenceLevel.NO_EVIDENCE, result.evidenceLevel());
        assertTrue(result.evidence().isEmpty() || result.evidence().get(0).combinedRank() == 1,
                "the irrelevant chunk was still rank 1 — proving rank did not drive the decision");
    }

    @Test
    void rrfRankOneStillYieldsNoEvidenceRegardlessOfTheFusionScore() {
        seedChunkAtOrigin("AROORAA turns ideas and business problems into production-ready digital products.");

        RetrievalResult result = retrieveWithSimilarity("Tell me the capital of Brazil.", 0.08);

        assertEquals(EvidenceLevel.NO_EVIDENCE, result.evidenceLevel());
        if (!result.evidence().isEmpty()) {
            Evidence top = result.evidence().get(0);
            // The only candidate in the corpus is necessarily rank 1 with a strictly positive
            // fusion score, whatever its exact value — that is the point being proven: however
            // good the fusion numbers look, they do not decide confidence.
            assertEquals(1, top.combinedRank());
            assertTrue(top.normalizedScore() > 0.0);
        }
    }

    @Test
    void highAbsoluteSimilarityWithSharedVocabularyProducesStrongEvidence() {
        seedChunkAtOrigin("MESA is AROORAA's connected restaurant technology ecosystem for kitchen coordination.");

        RetrievalResult result = retrieveWithSimilarity("What is MESA restaurant technology?", 0.62);

        assertEquals(EvidenceLevel.STRONG_EVIDENCE, result.evidenceLevel());
        assertEquals(0.62, result.signals().topVectorSimilarity(), 0.01);
    }

    @Test
    void borderlineSimilarityProducesWeakEvidence() {
        seedChunkAtOrigin("MESA connects dine-in ordering, kitchen and staff operations into one real-time system.");

        // Between the weak and strong similarity thresholds, with only partial term coverage.
        RetrievalResult result = retrieveWithSimilarity("Does the platform handle payroll scheduling?", 0.33);

        assertEquals(EvidenceLevel.WEAK_EVIDENCE, result.evidenceLevel());
    }

    @Test
    void lowAbsoluteSimilarityProducesNoEvidence() {
        seedChunkAtOrigin("MESA connects dine-in ordering, kitchen and staff operations into one real-time system.");

        RetrievalResult result = retrieveWithSimilarity("What medicine should I take for fever?", 0.15);

        assertEquals(EvidenceLevel.NO_EVIDENCE, result.evidenceLevel());
    }

    @Test
    void retrievalResultCarriesTheSignalsTheDecisionWasMadeFrom() {
        seedChunkAtOrigin("Mindra is a distinct AROORAA product with its own domain.");

        RetrievalResult result = retrieveWithSimilarity("What is Mindra?", 0.70);

        RelevanceSignals signals = result.signals();
        assertEquals(0.70, signals.topVectorSimilarity(), 0.01);
        assertTrue(signals.queryTermCoverage() > 0.0, "Mindra appears in the evidence text");
        assertTrue(signals.signalsAgree(), "both searches returned the same top chunk");
    }

    @Test
    void evidenceCarriesTheGroundingMetadataA3WillNeed() {
        seedChunkAtOrigin("MESA is AROORAA's connected restaurant technology ecosystem.");

        RetrievalResult result = retrieveWithSimilarity("What is MESA restaurant technology?", 0.62);

        Evidence top = result.evidence().get(0);
        assertTrue(top.documentId() != null && top.documentVersionId() != null && top.chunkId() != null);
        assertEquals("Bands Test", top.documentTitle());
        assertEquals("AROORAA_PUBLIC", top.knowledgeSpace());
        assertEquals(1, top.versionNumber());
        assertTrue(top.text().contains("MESA"));
        assertTrue(top.vectorSimilarity() != null && top.vectorRank() != null);
    }
}
