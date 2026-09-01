package com.arooraa.aura.retrieval;

import com.arooraa.aura.ingestion.IngestionService;
import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.imports.KnowledgeActivationService;
import com.arooraa.aura.knowledge.imports.KnowledgeApprovalService;
import com.arooraa.aura.knowledge.imports.KnowledgeImportService;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
import com.arooraa.aura.retrieval.search.LexicalHit;
import com.arooraa.aura.retrieval.search.LexicalSearchRepository;
import com.arooraa.aura.retrieval.search.VectorHit;
import com.arooraa.aura.retrieval.search.VectorSearchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Proves the three synthetic adversarial tokens (see {@code EvaluationSets#ADVERSARIAL_TOKENS})
 * stay unretrievable at every retrieval layer independently — lexical, vector, and the fused
 * hybrid path ({@link KnowledgeBaseAcceptanceIT} already covers hybrid against the same corpus;
 * this class isolates the two lower layers so a defect in fusion could never mask a boundary leak
 * at the layer underneath).
 */
@Testcontainers
@SpringBootTest
class AdversarialRetrievalIT {

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
    private KnowledgeImportService importService;
    @Autowired
    private KnowledgeApprovalService approvalService;
    @Autowired
    private IngestionService ingestionService;
    @Autowired
    private KnowledgeActivationService activationService;
    @Autowired
    private AuraDocumentVersionRepository versionRepository;
    @Autowired
    private AuraChunkRepository chunkRepository;
    @Autowired
    private LexicalSearchRepository lexicalSearchRepository;
    @Autowired
    private VectorSearchRepository vectorSearchRepository;
    @Autowired
    private EmbeddingProvider embeddingProvider;

    @BeforeEach
    void seedFixtures() {
        new KnowledgeCorpusFixture(importService, approvalService, ingestionService, activationService, versionRepository)
                .seedAll();
    }

    @Test
    void allThreeAdversarialTokensAreExcludedAtTheLexicalLayer() {
        for (String token : EvaluationSets.ADVERSARIAL_TOKENS) {
            List<LexicalHit> hits = lexicalSearchRepository.search(token, Set.of("AROORAA_PUBLIC"), 10);
            assertNoHitContainsToken(hits.stream().map(LexicalHit::chunkId).toList(), token,
                    "lexical search returned the token's chunk despite INTERNAL visibility or unauthorized space");
        }
    }

    @Test
    void allThreeAdversarialTokensAreExcludedAtTheVectorLayer() {
        for (String token : EvaluationSets.ADVERSARIAL_TOKENS) {
            float[] queryVector = embeddingProvider.embed(token).vector();
            List<VectorHit> hits = vectorSearchRepository.search(queryVector, Set.of("AROORAA_PUBLIC"), 1, 10);
            assertNoHitContainsToken(hits.stream().map(VectorHit::chunkId).toList(), token,
                    "vector search returned the token's chunk despite INTERNAL visibility or unauthorized space");
        }
    }

    private void assertNoHitContainsToken(List<UUID> chunkIds, String token, String message) {
        for (UUID chunkId : chunkIds) {
            AuraChunk chunk = chunkRepository.findById(chunkId).orElseThrow();
            assertTrue(!chunk.getContent().contains(token), message + ": " + token);
        }
    }
}
