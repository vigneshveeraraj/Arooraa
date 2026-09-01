package com.arooraa.aura.ingestion;

import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.AuraEmbedding;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.domain.Visibility;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.knowledge.repository.AuraEmbeddingRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-end proof that the pgvector migration strategy actually works locally (acceptance-gate
 * item 5): a real chunk gets a real 1536-dimension vector written to and read back from the
 * {@code vector(1536)} column through the custom Hibernate type, via a real Postgres+pgvector
 * container — not mocked. The embedding provider is swapped for a deterministic, test-only stub
 * (see {@link StubEmbeddingProvider}'s Javadoc for why that class can never ship to production).
 */
@Testcontainers
@SpringBootTest
class IngestionServiceIT {

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
    private IngestionService ingestionService;

    @Test
    void ingestingAnApprovedVersionPersistsRealChunksAndVectors() {
        UUID documentId = documentRepository.save(
                new AuraDocument("ingest-test-" + UUID.randomUUID(), "Ingestion test doc", "company", null, null, null)).getId();
        String content = "AROORAA turns ideas and business problems into production-ready digital products.\n\n"
                + "The journey runs discovery, product strategy, UX, architecture, engineering, AI, cloud, launch and continuous support.";
        AuraDocumentVersion version = new AuraDocumentVersion(documentId, 1, Visibility.PUBLIC, null, null, content);
        version.approve("owner@arooraa.com");
        version = versionRepository.save(version);

        AuraIngestionJob job = ingestionService.ingest(version.getId());

        assertEquals(IngestionJobStatus.SUCCEEDED, job.getStatus());
        assertTrue(job.getChunkCount() >= 1);

        List<AuraChunk> chunks = chunkRepository.findByDocumentVersionIdOrderByChunkIndex(version.getId());
        assertFalse(chunks.isEmpty());

        for (AuraChunk chunk : chunks) {
            AuraEmbedding embedding = embeddingRepository.findByChunkIdAndGeneration(chunk.getId(), 1).orElseThrow();
            assertEquals(1536, embedding.getDimensions());
            assertEquals(1536, embedding.getEmbedding().length);
            assertEquals("stub-embedding-model", embedding.getEmbeddingModel());
            // A2 embedding provenance metadata — provider and generation persisted per vector.
            assertEquals("stub", embedding.getProvider());
            assertEquals(1, embedding.getGeneration());
        }

        AuraDocumentVersion reloaded = versionRepository.findById(version.getId()).orElseThrow();
        assertEquals(DocumentStatus.INDEXED, reloaded.getStatus());
    }
}
