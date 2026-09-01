package com.arooraa.aura.retrieval.search;

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
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Proves cosine-similarity vector search returns genuinely relevant results (real pgvector
 * container, real HNSW-indexed column) and that the PUBLIC+INDEXED+active+knowledge-space
 * eligibility boundary is enforced in the query itself.
 */
@Testcontainers
@SpringBootTest
class VectorSearchRepositoryIT {

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
    @Autowired
    private AuraEmbeddingRepository embeddingRepository;
    @Autowired
    private VectorSearchRepository vectorSearchRepository;

    private final EmbeddingProvider stub = new StubEmbeddingProvider();

    private UUID seedChunk(String text, Visibility visibility, DocumentStatus status, boolean active, String knowledgeSpace) {
        AuraDocument document = documentRepository.save(
                new AuraDocument("vec-" + UUID.randomUUID(), "Vector Test", "test", null, null, null, knowledgeSpace));
        AuraDocumentVersion version = new AuraDocumentVersion(document.getId(), 1, visibility, ProductStatus.AVAILABLE, null, text);
        version.approve("owner@arooraa.com");
        if (status == DocumentStatus.INDEXED) {
            version.markIndexed();
        }
        if (active) {
            version.activate();
        }
        version = versionRepository.save(version);
        AuraChunk chunk = chunkRepository.save(new AuraChunk(version.getId(), 0, text, null));
        embeddingRepository.save(new AuraEmbedding(chunk.getId(), "stub-embedding-model", "stub", 1, stub.embed(text).vector()));
        return chunk.getId();
    }

    @Test
    void vectorSearchRanksTheMoreSimilarChunkFirst() {
        UUID mesaChunk = seedChunk("MESA is a connected restaurant technology ecosystem for dine-in ordering and kitchen operations.",
                Visibility.PUBLIC, DocumentStatus.INDEXED, true, "AROORAA_PUBLIC");
        UUID mindraChunk = seedChunk("Mindra is a separate AROORAA product in a different domain entirely.",
                Visibility.PUBLIC, DocumentStatus.INDEXED, true, "AROORAA_PUBLIC");

        List<VectorHit> hits = vectorSearchRepository.search(
                stub.embed("What does MESA do for restaurants?").vector(), Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().anyMatch(h -> h.chunkId().equals(mesaChunk)));
        int mesaIndex = indexOf(hits, mesaChunk);
        int mindraIndex = indexOf(hits, mindraChunk);
        assertTrue(mesaIndex < mindraIndex, "the chunk sharing vocabulary with the query should rank first");
    }

    @Test
    void internalVisibilityIsExcludedFromVectorSearch() {
        UUID internalChunk = seedChunk("INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ database internals disclosed here.",
                Visibility.INTERNAL, DocumentStatus.INDEXED, true, "AROORAA_PUBLIC");

        List<VectorHit> hits = vectorSearchRepository.search(
                stub.embed("INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ").vector(), Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(internalChunk)));
    }

    @Test
    void draftVersionIsExcludedFromVectorSearch() {
        AuraDocument document = documentRepository.save(
                new AuraDocument("vec-draft-" + UUID.randomUUID(), "Draft", "test", null, null, null));
        AuraDocumentVersion draft = versionRepository.save(
                new AuraDocumentVersion(document.getId(), 1, Visibility.PUBLIC, null, null, "Draft content never approved."));
        AuraChunk chunk = chunkRepository.save(new AuraChunk(draft.getId(), 0, "Draft content never approved.", null));
        embeddingRepository.save(new AuraEmbedding(chunk.getId(), "stub-embedding-model", "stub", 1,
                stub.embed("Draft content never approved.").vector()));

        List<VectorHit> hits = vectorSearchRepository.search(
                stub.embed("Draft content never approved.").vector(), Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(chunk.getId())));
    }

    @Test
    void archivedVersionIsExcludedFromVectorSearch() {
        AuraDocument document = documentRepository.save(
                new AuraDocument("vec-archived-" + UUID.randomUUID(), "Archived", "test", null, null, null));
        AuraDocumentVersion version = new AuraDocumentVersion(document.getId(), 1, Visibility.PUBLIC, null, null, "Archived content.");
        version.approve("owner@arooraa.com");
        version.markIndexed();
        version.activate();
        version.archive();
        version = versionRepository.save(version);
        AuraChunk chunk = chunkRepository.save(new AuraChunk(version.getId(), 0, "Archived content.", null));
        embeddingRepository.save(new AuraEmbedding(chunk.getId(), "stub-embedding-model", "stub", 1,
                stub.embed("Archived content.").vector()));

        List<VectorHit> hits = vectorSearchRepository.search(
                stub.embed("Archived content.").vector(), Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(chunk.getId())));
    }

    @Test
    void anInactiveHistoricalVersionIsExcludedFromVectorSearch() {
        UUID inactiveChunk = seedChunk("UniqueInactiveVectorMarker content from a superseded historical version.",
                Visibility.PUBLIC, DocumentStatus.INDEXED, false, "AROORAA_PUBLIC");

        List<VectorHit> hits = vectorSearchRepository.search(
                stub.embed("UniqueInactiveVectorMarker content from a superseded historical version.").vector(),
                Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(inactiveChunk)));
    }

    @Test
    void aChunkInAnUnauthorizedKnowledgeSpaceIsExcludedEvenIfOtherwiseFullyEligible() {
        UUID chunkInOtherSpace = seedChunk("Content that would otherwise be perfectly eligible for retrieval.",
                Visibility.PUBLIC, DocumentStatus.INDEXED, true, "MESA_PUBLIC");

        List<VectorHit> hits = vectorSearchRepository.search(
                stub.embed("Content that would otherwise be perfectly eligible for retrieval.").vector(),
                Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(chunkInOtherSpace)),
                "common Aura platform must not mean common searchable data across knowledge spaces");
    }

    @Test
    void distanceAndSimilarityAreConsistent() {
        UUID chunk = seedChunk("A specific sentence for similarity scoring.", Visibility.PUBLIC, DocumentStatus.INDEXED, true, "AROORAA_PUBLIC");

        List<VectorHit> hits = vectorSearchRepository.search(
                stub.embed("A specific sentence for similarity scoring.").vector(), Set.of("AROORAA_PUBLIC"), 10);

        VectorHit exactMatch = hits.stream().filter(h -> h.chunkId().equals(chunk)).findFirst().orElseThrow();
        assertEquals(0.0, exactMatch.distance(), 0.01, "identical text embedded twice should have ~zero cosine distance");
    }

    private static int indexOf(List<VectorHit> hits, UUID chunkId) {
        for (int i = 0; i < hits.size(); i++) {
            if (hits.get(i).chunkId().equals(chunkId)) {
                return i;
            }
        }
        throw new AssertionError("chunk not found in results: " + chunkId);
    }
}
