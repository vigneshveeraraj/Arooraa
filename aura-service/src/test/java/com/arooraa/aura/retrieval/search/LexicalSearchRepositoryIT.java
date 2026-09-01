package com.arooraa.aura.retrieval.search;

import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.domain.Visibility;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
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

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Proves PostgreSQL-native full-text search finds real lexical matches (chunk text, section
 * heading, and document title/product/service) and enforces the same eligibility boundary as
 * vector search.
 */
@Testcontainers
@SpringBootTest
class LexicalSearchRepositoryIT {

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
    private LexicalSearchRepository lexicalSearchRepository;

    private UUID seedChunk(String product, String text, Visibility visibility, DocumentStatus status, boolean active, String knowledgeSpace) {
        AuraDocument document = documentRepository.save(
                new AuraDocument("lex-" + UUID.randomUUID(), "Lexical Test", "test", null, product, null, knowledgeSpace));
        AuraDocumentVersion version = new AuraDocumentVersion(document.getId(), 1, visibility, null, null, text);
        version.approve("owner@arooraa.com");
        if (status == DocumentStatus.INDEXED) {
            version.markIndexed();
        }
        if (active) {
            version.activate();
        }
        version = versionRepository.save(version);
        return chunkRepository.save(new AuraChunk(version.getId(), 0, text, null)).getId();
    }

    @Test
    void lexicalSearchFindsAChunkContainingTheQueryWord() {
        UUID mindraChunk = seedChunk(null, "Mindra is a distinct AROORAA product with its own domain.",
                Visibility.PUBLIC, DocumentStatus.INDEXED, true, "AROORAA_PUBLIC");
        UUID unrelatedChunk = seedChunk(null, "This chunk discusses an entirely unrelated topic about weather patterns.",
                Visibility.PUBLIC, DocumentStatus.INDEXED, true, "AROORAA_PUBLIC");

        List<LexicalHit> hits = lexicalSearchRepository.search("Mindra", Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().anyMatch(h -> h.chunkId().equals(mindraChunk)));
        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(unrelatedChunk)));
    }

    @Test
    void lexicalSearchMatchesOnDocumentProductMetadataEvenWhenChunkTextDoesNotContainTheWord() {
        UUID chunk = seedChunk("MESA", "This chunk describes dine-in ordering and kitchen coordination without naming the product.",
                Visibility.PUBLIC, DocumentStatus.INDEXED, true, "AROORAA_PUBLIC");

        List<LexicalHit> hits = lexicalSearchRepository.search("MESA", Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().anyMatch(h -> h.chunkId().equals(chunk)),
                "product metadata on the owning document should also be searchable");
    }

    @Test
    void internalVisibilityIsExcludedEvenOnAnExactPhraseMatch() {
        UUID internalChunk = seedChunk(null, "INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ must never be retrievable.",
                Visibility.INTERNAL, DocumentStatus.INDEXED, true, "AROORAA_PUBLIC");

        List<LexicalHit> hits = lexicalSearchRepository.search("INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ", Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(internalChunk)));
    }

    @Test
    void draftVersionIsExcludedFromLexicalSearch() {
        AuraDocument document = documentRepository.save(
                new AuraDocument("lex-draft-" + UUID.randomUUID(), "Draft", "test", null, null, null));
        AuraDocumentVersion draft = versionRepository.save(
                new AuraDocumentVersion(document.getId(), 1, Visibility.PUBLIC, null, null, "UniqueDraftMarkerWord content."));
        UUID chunkId = chunkRepository.save(new AuraChunk(draft.getId(), 0, "UniqueDraftMarkerWord content.", null)).getId();

        List<LexicalHit> hits = lexicalSearchRepository.search("UniqueDraftMarkerWord", Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(chunkId)));
    }

    @Test
    void archivedVersionIsExcludedFromLexicalSearch() {
        AuraDocument document = documentRepository.save(
                new AuraDocument("lex-archived-" + UUID.randomUUID(), "Archived", "test", null, null, null));
        AuraDocumentVersion version = new AuraDocumentVersion(document.getId(), 1, Visibility.PUBLIC, null, null, "UniqueArchivedMarkerWord content.");
        version.approve("owner@arooraa.com");
        version.markIndexed();
        version.activate();
        version.archive();
        version = versionRepository.save(version);
        UUID chunkId = chunkRepository.save(new AuraChunk(version.getId(), 0, "UniqueArchivedMarkerWord content.", null)).getId();

        List<LexicalHit> hits = lexicalSearchRepository.search("UniqueArchivedMarkerWord", Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(chunkId)));
    }

    @Test
    void anInactiveHistoricalVersionIsExcludedFromLexicalSearch() {
        UUID inactiveChunk = seedChunk(null, "UniqueInactiveLexicalMarker content from a superseded historical version.",
                Visibility.PUBLIC, DocumentStatus.INDEXED, false, "AROORAA_PUBLIC");

        List<LexicalHit> hits = lexicalSearchRepository.search("UniqueInactiveLexicalMarker", Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(inactiveChunk)));
    }

    @Test
    void aChunkInAnUnauthorizedKnowledgeSpaceIsExcludedFromLexicalSearch() {
        UUID chunkInOtherSpace = seedChunk(null, "UniqueOtherSpaceMarkerWord content that is otherwise eligible.",
                Visibility.PUBLIC, DocumentStatus.INDEXED, true, "MESA_PUBLIC");

        List<LexicalHit> hits = lexicalSearchRepository.search("UniqueOtherSpaceMarkerWord", Set.of("AROORAA_PUBLIC"), 10);

        assertTrue(hits.stream().noneMatch(h -> h.chunkId().equals(chunkInOtherSpace)));
    }
}
