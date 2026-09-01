package com.arooraa.aura.retrieval;

import com.arooraa.aura.ingestion.IngestionService;
import com.arooraa.aura.knowledge.imports.KnowledgeActivationService;
import com.arooraa.aura.knowledge.imports.KnowledgeApprovalService;
import com.arooraa.aura.knowledge.imports.KnowledgeImportService;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The A2/A2.1 secretless local evaluation fixture: imports, approves, ingests and activates the
 * reviewed corpus (see {@link KnowledgeCorpusFixture}), then runs the positive, negative,
 * internal-boundary and Tamil/Tanglish evaluation sets (see {@link EvaluationSets}) through the
 * real {@link HybridRetrievalService}. No LLM answer is generated — only evidence and its
 * classification are inspected.
 *
 * <p>Uses {@link StubEmbeddingProvider} — deterministic, no network, no key. This proves
 * retrieval *mechanics* (fusion, absolute-relevance gating, eligibility boundary) correctly on
 * every normal build; it cannot prove real semantic/multilingual quality — that is
 * {@link EmbeddingCalibrationIT}'s job, gated on a real {@code OPENAI_API_KEY} and run separately.
 *
 * <p>Seeds via {@code @BeforeEach}, not {@code @BeforeAll}: {@code @TestInstance(PER_CLASS)}
 * combined with {@code @Testcontainers}/{@code @DynamicPropertySource} fails ("mapped port can
 * only be obtained after the container is started"). {@link KnowledgeCorpusFixture} is fully
 * idempotent, so re-seeding before every test is cheap and correct.
 */
@Testcontainers
@SpringBootTest
class KnowledgeBaseAcceptanceIT {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeBaseAcceptanceIT.class);

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
    private HybridRetrievalService retrievalService;
    @Autowired
    private AuraDocumentVersionRepository versionRepository;

    @BeforeEach
    void seedApprovedKnowledgeBase() {
        new KnowledgeCorpusFixture(importService, approvalService, ingestionService, activationService, versionRepository)
                .seedAll();
    }

    private RetrievalResult evaluate(String question) {
        long start = System.nanoTime();
        RetrievalResult result = retrievalService.retrieve(
                new RetrievalRequest(question, AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));
        double elapsedMs = (System.nanoTime() - start) / 1_000_000.0;
        String topSlug = result.evidence().isEmpty() ? "(none)" : result.evidence().get(0).documentSlug();
        log.info("QUESTION: \"{}\" -> level={} topSlug={} similarity={} coverage={} agree={} evidenceCount={} latencyMs={}",
                question, result.evidenceLevel(), topSlug, fmt(result.signals().topVectorSimilarity()),
                fmt(result.signals().queryTermCoverage()), result.signals().signalsAgree(),
                result.evidence().size(), String.format(Locale.ROOT, "%.2f", elapsedMs));
        return result;
    }

    private static String fmt(Double value) {
        return value == null ? "n/a" : String.format(Locale.ROOT, "%.3f", value);
    }

    // --- Positive set: relevant approved knowledge should be found -----------------------------

    /**
     * Asserts <em>retrieval</em>, not confidence: the right document must come back for each
     * question the corpus answers. Evidence level is deliberately not asserted here, because A2.2
     * calibrated the similarity thresholds against the real provider (positives 0.583..0.740,
     * unrelated 0.042..0.275) and the bag-of-words stub produces similarities on a completely
     * different scale (positives 0.180..0.470) — a level assertion here would measure the stub's
     * arithmetic, not the gate's correctness. The bands are proven deterministically by
     * {@link EvidenceBandsIT} and against the real provider by {@link EmbeddingCalibrationIT};
     * levels are still logged above for the record.
     */
    @Test
    void positiveSetRetrievesRelevantEvidence() {
        int returnedEvidence = 0;
        for (EvaluationSets.Query query : EvaluationSets.POSITIVE) {
            RetrievalResult result = evaluate(query.text());
            if (!result.evidence().isEmpty()) {
                returnedEvidence++;
            }
            if (query.expectedSlug() != null && !result.evidence().isEmpty()) {
                assertTrue(result.evidence().stream().anyMatch(e -> e.documentSlug().equals(query.expectedSlug())),
                        "expected " + query.expectedSlug() + " among evidence for: " + query.text());
            }
        }
        assertTrue(returnedEvidence >= (int) Math.ceil(EvaluationSets.POSITIVE.size() * 0.8),
                "expected at least 80% of positive questions to retrieve candidate evidence, got "
                        + returnedEvidence + "/" + EvaluationSets.POSITIVE.size());
    }

    // --- Negative set: no AROORAA-specific evidence should be manufactured --------------------

    /**
     * The hard invariant is "never STRONG" — a confident factual claim manufactured from nothing.
     * WEAK is tolerated here: the bag-of-words stub can spuriously inflate similarity for a short,
     * vocabulary-sparse query through pure hash-collision noise (observed for "Write a poem about
     * the moon.", similarity 0.386 against no real shared meaning) in a way a genuine embedding
     * model does not — the same question measures 0.136 with the real provider and lands at
     * NO_EVIDENCE, which {@link EmbeddingCalibrationIT} asserts for the whole negative set.
     */
    @Test
    void negativeSetNeverProducesStrongEvidence() {
        for (EvaluationSets.Query query : EvaluationSets.NEGATIVE) {
            RetrievalResult result = evaluate(query.text());
            assertTrue(result.evidenceLevel() != EvidenceLevel.STRONG_EVIDENCE,
                    "a question with no AROORAA-specific evidence must never read as confident: " + query.text());
        }
    }

    // --- Internal-boundary set: measured, not strictly asserted at the retrieval layer --------

    /**
     * A2.1 deliberately does NOT hard-fail this set on any particular {@link EvidenceLevel}.
     * Reaching STRONG here can mean two different things this layer cannot distinguish: (a) the
     * system confidently found the passage that correctly states the confidentiality boundary
     * applies (safe — see e.g. "What database does MESA use internally?" against 10-mesa.md's own
     * "must not disclose" section: STRONG, but the retrieved text is a refusal, not a leak), or
     * (b) a genuine over-confident disclosure. Telling those apart needs the future scope/
     * confidentiality classifier the milestone brief explicitly defers to A3 ("A2.1 does NOT need
     * the full conversation classifier"). What A2.1 must and does guarantee is structural: no fact
     * exists in the approved corpus for these questions to fabricate an answer from, and the
     * synthetic/real INTERNAL fixtures never surface (see the dedicated tests below).
     */
    @Test
    void internalBoundarySetIsMeasuredForAFutureScopeClassifier() {
        for (EvaluationSets.Query query : EvaluationSets.INTERNAL_BOUNDARY) {
            assertDoesNotThrow(() -> evaluate(query.text()));
        }
    }

    // --- Multilingual (stub) baseline — recorded, not strictly asserted; see EmbeddingCalibrationIT ---

    @Test
    void multilingualSetIsMeasuredWithoutCrashing() {
        for (EvaluationSets.Query query : EvaluationSets.MULTILINGUAL) {
            assertDoesNotThrow(() -> evaluate(query.text()));
        }
    }

    // --- Adversarial fixtures — exact-token exclusion at every retrieval layer -----------------

    @Test
    void everyAdversarialTokenIsUnretrievableThroughHybridRetrieval() {
        for (String token : EvaluationSets.ADVERSARIAL_TOKENS) {
            RetrievalResult result = evaluate(token);
            assertTrue(result.evidence().stream().noneMatch(e -> e.text().contains(token)),
                    "adversarial token leaked through hybrid retrieval: " + token);
        }
    }

    @Test
    void realInternalPolicyDocumentIsNeverRetrievableThroughPublicRetrieval() {
        RetrievalResult result = evaluate("What is Aura's confidentiality and safety policy?");
        assertTrue(result.evidence().stream().noneMatch(e -> e.documentSlug().equals(KnowledgeCorpusFixture.POLICY_SLUG)),
                "a real Aura policy document must never surface via the public retrieval path");
    }

    @Test
    void unauthorizedKnowledgeSpaceFixtureNeverSurfacesForTheWebsiteProfile() {
        RetrievalResult result = evaluate("MESA_INTERNAL_DATABASE_FAKE_123");
        assertTrue(result.evidence().stream().noneMatch(e -> e.documentSlug().equals("97-unauthorized-space-fixture")));
    }
}
