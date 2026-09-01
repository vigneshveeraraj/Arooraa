package com.arooraa.aura.bootstrap;

import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.domain.KnowledgeSpaces;
import com.arooraa.aura.knowledge.domain.SectionEligibility;
import com.arooraa.aura.knowledge.domain.Visibility;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
import com.arooraa.aura.retrieval.Evidence;
import com.arooraa.aura.retrieval.HybridRetrievalService;
import com.arooraa.aura.retrieval.RetrievalRequest;
import com.arooraa.aura.retrieval.RetrievalResult;
import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;
import com.arooraa.aura.retrieval.search.LexicalSearchRepository;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The operator path, end to end against real Postgres/pgvector: load the approved public corpus,
 * then ask Aura's own retrieval stack whether it can find it.
 *
 * <p>The bootstrap bean is active here (the property is set), so the corpus is already loaded by the
 * time any test runs — which is also the assertion that startup loading works at all.
 */
@Testcontainers
@SpringBootTest(properties = {
        "aura.bootstrap.public-knowledge=true",
        "aura.bootstrap.source-directory=knowledge-seed"
})
class PublicKnowledgeBootstrapIT {

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
    static class StubProvider {
        @Bean
        @Primary
        EmbeddingProvider stubEmbeddingProvider() {
            return new StubEmbeddingProvider();
        }
    }

    @Autowired
    private PublicKnowledgeBootstrap bootstrap;
    @Autowired
    private AuraDocumentRepository documentRepository;
    @Autowired
    private AuraDocumentVersionRepository versionRepository;
    @Autowired
    private HybridRetrievalService retrievalService;
    @Autowired
    private AuraChunkRepository chunkRepository;
    @Autowired
    private LexicalSearchRepository lexicalSearchRepository;

    @Test
    void startupLoadedTheApprovedPublicCorpus() {
        List<AuraDocument> documents = documentRepository.findAll();

        assertFalse(documents.isEmpty(), "the bootstrap should have run during context startup");
        assertTrue(documents.size() >= 8, "expected the public corpus, got " + documents.size() + " document(s)");
        for (AuraDocument document : documents) {
            assertEquals(KnowledgeSpaces.AROORAA_PUBLIC, document.getKnowledgeSpace(), document.getSlug());
        }
    }

    @Test
    void everyLoadedDocumentIsIndexedActiveAndPublic() {
        for (AuraDocument document : documentRepository.findAll()) {
            List<AuraDocumentVersion> versions = versionRepository.findByDocumentIdOrderByVersionNumberDesc(
                    document.getId());

            assertEquals(1, versions.size(), document.getSlug() + " should have exactly one version");
            AuraDocumentVersion version = versions.get(0);
            assertEquals(DocumentStatus.INDEXED, version.getStatus(), document.getSlug());
            assertEquals(Visibility.PUBLIC, version.getVisibility(), document.getSlug());
            assertTrue(version.isActive(), document.getSlug());
        }
    }

    @Test
    void auraPolicyDocumentsAreNeverLoaded() {
        // Both of the independent controls are checked, on the real policy documents rather than a
        // fixture: INTERNAL visibility and the AURA_POLICY knowledge space.
        for (String policySlug : List.of("90-aura-personality", "91-aura-confidentiality-and-safety",
                "92-aura-conversation-policy", "93-aura-project-discovery-policy",
                "94-aura-handoff-policy", "95-aura-unknown-answer-policy")) {
            assertTrue(documentRepository.findBySlug(policySlug).isEmpty(),
                    "a policy document must never enter public knowledge: " + policySlug);
        }
    }

    @Test
    void documentsAwaitingOwnerApprovalAreSkippedByName() {
        // 43-public-faq is marked review_status: NEEDS_OWNER_APPROVAL in the seed, because it
        // carries a claim nobody has confirmed. The bootstrap respects that marker.
        assertTrue(documentRepository.findBySlug("43-public-faq").isEmpty(),
                "a document still awaiting owner approval must not be indexed");

        BootstrapSummary summary = bootstrap.bootstrap();
        assertTrue(summary.skipped().stream().anyMatch(entry -> entry.startsWith("43-public-faq")),
                "the skip should be reported by name: " + summary.skipped());
        // Every policy document is reported too, so a run's log accounts for every file it saw.
        // The reason shown is whichever control fired first — visibility, here — and that is the
        // point: either control alone is enough to keep policy content out.
        assertTrue(summary.skipped().stream().anyMatch(entry -> entry.startsWith("91-aura-confidentiality")),
                "policy documents should be reported as skipped, not silently ignored: " + summary.skipped());
    }

    @Test
    void rerunningTheBootstrapChangesNothing() {
        long documentsBefore = documentRepository.count();
        long versionsBefore = versionRepository.count();

        BootstrapSummary first = bootstrap.bootstrap();
        BootstrapSummary second = bootstrap.bootstrap();

        assertEquals(documentsBefore, documentRepository.count(), "a rerun must not create documents");
        assertEquals(versionsBefore, versionRepository.count(), "a rerun must not create versions");
        assertTrue(first.indexed().isEmpty(), "everything was already current: " + first.indexed());
        assertTrue(second.failed().isEmpty(), second.failed().toString());
        assertFalse(second.unchanged().isEmpty(), "a rerun should report the corpus as already current");
    }

    @Test
    void retrievalWorksAgainstTheBootstrappedCorpus() {
        RetrievalResult result = retrievalService.retrieve(new RetrievalRequest(
                "What is MESA?", AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));

        assertFalse(result.evidence().isEmpty(), "bootstrapped knowledge should be retrievable");
        assertTrue(result.evidence().stream().anyMatch(e -> e.documentSlug().equals("10-mesa")),
                "expected 10-mesa among the evidence");
    }

    @Test
    void noSectionOfTheRealCorpusIsAssistantGuidance() {
        // A3.3 finding 2, swept over every chunk the real 20-document corpus produced. Five public
        // documents carry a section written at Aura rather than at a reader; none of them may
        // survive chunking, and no chunk may carry an editorial note either.
        List<AuraChunk> chunks = chunkRepository.findAll();

        assertFalse(chunks.isEmpty(), "the corpus should have produced chunks");
        for (AuraChunk chunk : chunks) {
            assertFalse(SectionEligibility.isAssistantControlHeading(chunk.getSectionHeading()),
                    "a guidance section became a chunk: " + chunk.getSectionHeading());
            assertFalse(chunk.getContent().contains("NEEDS_OWNER_APPROVAL"),
                    "editorial review metadata was indexed: " + chunk.getSectionHeading());
            assertFalse(chunk.getContent().contains("91-aura-confidentiality-and-safety"),
                    "an internal policy filename was indexed: " + chunk.getSectionHeading());
        }
    }

    @Test
    void theMesaGuidanceSectionIsNeitherEvidenceNorACitation() {
        for (String question : List.of("What about MESA", "What is MESA?",
                "What must Aura not disclose about MESA?")) {
            RetrievalResult result = retrievalService.retrieve(new RetrievalRequest(
                    question, AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));

            for (Evidence evidence : result.evidence()) {
                assertFalse(SectionEligibility.isAssistantControlHeading(evidence.sectionHeading()),
                        "returned a guidance section for \"" + question + "\": " + evidence.sectionHeading());
                assertFalse(evidence.text().contains("Internal implementation detail is out of scope"),
                        "returned guidance body text for: " + question);
            }
        }
    }

    @Test
    void aChunkIndexedBeforeSectionEligibilityIsStillKeptOutOfEvidence() {
        // The owner's local database was built before this rule existed and still holds the MESA
        // guidance chunk. Excluding it at chunking time does nothing for a row already written, so
        // the same predicate runs on the retrieval path — this is that second line, on a chunk
        // inserted the way the old chunker would have written it.
        AuraDocument mesa = documentRepository.findBySlug("10-mesa").orElseThrow();
        AuraDocumentVersion version = versionRepository.findByDocumentIdOrderByVersionNumberDesc(mesa.getId())
                .get(0);
        AuraChunk legacy = chunkRepository.save(new AuraChunk(version.getId(), 900,
                "What Aura must not disclose about MESA\n\nZOMBIECHUNKMARKER: internal implementation "
                        + "detail is out of scope for any answer — database technology, service architecture.",
                40, "What Aura must not disclose about MESA", null, null));
        try {
            assertFalse(lexicalSearchRepository.search("ZOMBIECHUNKMARKER",
                            Set.of(KnowledgeSpaces.AROORAA_PUBLIC), 10).isEmpty(),
                    "the test is only meaningful if search can actually reach the chunk");

            RetrievalResult result = retrievalService.retrieve(new RetrievalRequest(
                    "ZOMBIECHUNKMARKER database technology", AssistantProfile.AROORAA_WEBSITE,
                    Channel.PUBLIC_WEB));

            assertTrue(result.evidence().stream().noneMatch(e -> e.text().contains("ZOMBIECHUNKMARKER")),
                    "a pre-existing guidance chunk must not become evidence");
        } finally {
            chunkRepository.delete(legacy);
        }
    }

    @Test
    void noPolicyContentIsRetrievableAfterBootstrap() {
        RetrievalResult result = retrievalService.retrieve(new RetrievalRequest(
                "What is Aura's confidentiality and safety policy?",
                AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));

        assertTrue(result.evidence().stream().noneMatch(e -> e.documentSlug().startsWith("9")),
                "no policy document may surface through public retrieval");
    }
}
