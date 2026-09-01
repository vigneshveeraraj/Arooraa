package com.arooraa.aura.knowledge.repository;

import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.Visibility;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

/** Same PUBLIC+INDEXED+active boundary as the version-level test, expressed at chunk granularity. */
@Testcontainers
@SpringBootTest
class AuraChunkRepositoryIT {

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

    @Autowired
    private AuraDocumentRepository documentRepository;

    @Autowired
    private AuraDocumentVersionRepository versionRepository;

    @Autowired
    private AuraChunkRepository chunkRepository;

    private AuraDocumentVersion approvedVersion(Visibility visibility, boolean indexed, boolean active) {
        UUID documentId = documentRepository.save(
                new AuraDocument("chunk-test-" + UUID.randomUUID(), "Chunk test doc", "company", null, null, null)).getId();
        AuraDocumentVersion version = new AuraDocumentVersion(documentId, 1, visibility, null, null, "Content.");
        version.approve("owner@arooraa.com");
        if (indexed) {
            version.markIndexed();
        }
        if (active) {
            version.activate();
        }
        return versionRepository.save(version);
    }

    @Test
    void chunkOfEligibleVersionIsRetrievable() {
        AuraDocumentVersion version = approvedVersion(Visibility.PUBLIC, true, true);
        AuraChunk chunk = chunkRepository.save(new AuraChunk(version.getId(), 0, "eligible chunk text", null));

        List<AuraChunk> retrievable = chunkRepository.findAllRetrievable();

        assertTrue(retrievable.stream().anyMatch(c -> c.getId().equals(chunk.getId())));
    }

    @Test
    void chunkOfInternalVersionIsNeverRetrievable() {
        AuraDocumentVersion version = approvedVersion(Visibility.INTERNAL, true, true);
        AuraChunk chunk = chunkRepository.save(new AuraChunk(version.getId(), 0, "internal chunk text", null));

        List<AuraChunk> retrievable = chunkRepository.findAllRetrievable();

        assertTrue(retrievable.stream().noneMatch(c -> c.getId().equals(chunk.getId())));
    }

    @Test
    void chunkOfNotYetIndexedVersionIsNotRetrievable() {
        AuraDocumentVersion version = approvedVersion(Visibility.PUBLIC, false, true);
        AuraChunk chunk = chunkRepository.save(new AuraChunk(version.getId(), 0, "not indexed chunk text", null));

        List<AuraChunk> retrievable = chunkRepository.findAllRetrievable();

        assertTrue(retrievable.stream().noneMatch(c -> c.getId().equals(chunk.getId())));
    }
}
