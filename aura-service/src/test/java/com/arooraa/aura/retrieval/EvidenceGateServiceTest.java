package com.arooraa.aura.retrieval;

import com.arooraa.aura.retrieval.config.RetrievalProperties;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * The frozen contract: confidence comes from absolute relevance, never from RRF rank or score
 * (A2.1), and semantic similarity is the primary signal that lexical coverage may corroborate but
 * never override (A2.2). Thresholds here mirror application.yml's calibrated defaults.
 */
class EvidenceGateServiceTest {

    private static final double STRONG_SIMILARITY = 0.58;
    private static final double WEAK_SIMILARITY = 0.30;
    private static final double STRONG_COVERAGE = 0.75;
    private static final double WEAK_COVERAGE = 0.40;

    private final EvidenceGateService gate = new EvidenceGateService(new RetrievalProperties(20, 8, 60,
            new RetrievalProperties.Evidence(STRONG_SIMILARITY, WEAK_SIMILARITY, STRONG_COVERAGE, WEAK_COVERAGE)));

    /**
     * Deliberately built with the best possible RRF numbers — combinedRank 1, normalizedScore 1.0.
     * Every test below that expects anything other than STRONG proves rank alone cannot carry it.
     */
    private static List<Evidence> rankOneEvidence() {
        return List.of(new Evidence(UUID.randomUUID(), "10-mesa", "MESA", UUID.randomUUID(), 1, "AROORAA_PUBLIC",
                UUID.randomUUID(), 0, "Overview", null, "MESA is a connected restaurant technology ecosystem.",
                1, 0.9, 1, 0.8, 1, 0.0328, 1.0));
    }

    @Test
    void emptyEvidenceIsNoEvidence() {
        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(List.of(), RelevanceSignals.none()));
    }

    @Test
    void rankOneAloneCannotProduceStrongEvidence() {
        // The exact A2 defect: top-ranked, perfect normalized RRF score, but the passage is not
        // actually about the question.
        RelevanceSignals poorButTopRanked = new RelevanceSignals(0.11, 0.01, 0.0, false);

        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(rankOneEvidence(), poorButTopRanked));
    }

    @Test
    void irrelevantRankOneResultProducesNoEvidenceEvenWhenBothSearchesAgree() {
        // Agreement is trivially true when only one candidate exists — it must never create a
        // decision the absolute signals do not support.
        RelevanceSignals agreeingButIrrelevant = new RelevanceSignals(0.12, 0.02, 0.0, true);

        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(rankOneEvidence(), agreeingButIrrelevant));
    }

    // --- A2.2: lexical coverage corroborates, it never rescues --------------------------------

    /**
     * The A2.2 defect, measured against the real provider: "What is today's weather?" scored
     * similarity 0.275 with coverage 0.5 (the passage happened to contain "today"), and A2.1's gate
     * read that lexical overlap as an independent signal and returned WEAK_EVIDENCE. AROORAA has no
     * weather facts — below the semantic floor the honest answer is NO_EVIDENCE.
     */
    @Test
    void similarityBelowTheWeakFloorIsNoEvidenceEvenWithSubstantialLexicalCoverage() {
        RelevanceSignals weatherQueryShape = new RelevanceSignals(0.275, 0.6, 0.50, true);

        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(rankOneEvidence(), weatherQueryShape));
    }

    @Test
    void evenNearPerfectLexicalCoverageCannotRescueASemanticallyIrrelevantResult() {
        // Words match but the embedding says the passage is not about the question — e.g. a
        // confidentiality probe whose terms appear in a "what Aura must not disclose" section.
        RelevanceSignals contradicted = new RelevanceSignals(0.05, 0.6, 1.0, true);

        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(rankOneEvidence(), contradicted));
    }

    @Test
    void lowAbsoluteSimilarityAndLowCoverageProducesNoEvidence() {
        RelevanceSignals none = new RelevanceSignals(0.20, 0.0, 0.10, false);

        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(rankOneEvidence(), none));
    }

    // --- A2.2: a confident semantic match stands on its own ------------------------------------

    @Test
    void highSemanticSimilarityAloneProducesStrongEvidence() {
        // No lexical corroboration at all: coverage 0, searches disagree. Measured positives sit at
        // 0.583..0.740, so this range is where the embedding is genuinely confident.
        RelevanceSignals confident = new RelevanceSignals(0.68, null, 0.0, false);

        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(rankOneEvidence(), confident));
    }

    /**
     * Tamil/Tanglish queries retrieve the correct document with real embeddings ("AROORAA enna
     * company?" → 01-company-overview at 0.703) but score near-zero on {@link QueryTermCoverage},
     * which compares English tokens. Requiring lexical corroboration would cap every correct
     * multilingual answer at WEAK — so it is not required.
     */
    @Test
    void highSemanticSimilarityCarriesAMultilingualQueryWithoutEnglishLexicalSupport() {
        RelevanceSignals tanglish = new RelevanceSignals(0.703, null, 0.05, false);

        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(rankOneEvidence(), tanglish));
    }

    // --- Medium band: WEAK unless the lexical match is near-exact -------------------------------

    @Test
    void mediumSimilarityIsWeakWhenLexicalCoverageIsPartial() {
        // Above the semantic floor but short of confidence, and the passage answers only half the
        // question's words. Both searches agreeing does not change that.
        RelevanceSignals borderline = new RelevanceSignals(0.45, 0.3, 0.50, true);

        assertEquals(EvidenceLevel.WEAK_EVIDENCE, gate.classify(rankOneEvidence(), borderline));
    }

    @Test
    void mediumSimilarityWithNearExactLexicalCoverageProducesStrongEvidence() {
        // Exact-terminology questions: the passage literally answers the words asked, and the
        // embedding independently agrees it is on-topic. This is the one place coverage promotes.
        RelevanceSignals lexicallyExact = new RelevanceSignals(0.45, 0.6, 1.0, false);

        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(rankOneEvidence(), lexicallyExact));
    }

    // --- Lexical-only mode: no embedding provider configured ------------------------------------

    @Test
    void lexicalSignalAloneCanReachWeakWhenVectorSearchDidNotRun() {
        RelevanceSignals lexicalOnly = new RelevanceSignals(null, 0.4, 0.60, false);

        assertEquals(EvidenceLevel.WEAK_EVIDENCE, gate.classify(rankOneEvidence(), lexicalOnly));
    }

    @Test
    void nearExactLexicalCoverageCanReachStrongWhenVectorSearchDidNotRun() {
        RelevanceSignals lexicalOnly = new RelevanceSignals(null, 0.7, 0.90, false);

        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(rankOneEvidence(), lexicalOnly));
    }

    @Test
    void noUsableLexicalSignalWhenVectorSearchDidNotRunIsNoEvidence() {
        RelevanceSignals lexicalOnly = new RelevanceSignals(null, 0.01, 0.10, false);

        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(rankOneEvidence(), lexicalOnly));
    }

    // --- Configuration and boundaries -----------------------------------------------------------

    @Test
    void thresholdsAreConfigurable() {
        EvidenceGateService permissive = new EvidenceGateService(new RetrievalProperties(20, 8, 60,
                new RetrievalProperties.Evidence(0.10, 0.05, 0.10, 0.05)));
        RelevanceSignals modest = new RelevanceSignals(0.15, 0.1, 0.20, true);

        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(rankOneEvidence(), modest),
                "the calibrated gate rejects this");
        assertEquals(EvidenceLevel.STRONG_EVIDENCE, permissive.classify(rankOneEvidence(), modest),
                "a differently-configured gate accepts it — thresholds are the only difference");
    }

    @Test
    void exactlyAtThresholdCountsAsMeetingIt() {
        RelevanceSignals atStrong = new RelevanceSignals(STRONG_SIMILARITY, 0.3, 0.0, false);
        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(rankOneEvidence(), atStrong));

        RelevanceSignals atWeak = new RelevanceSignals(WEAK_SIMILARITY, 0.1, 0.0, false);
        assertEquals(EvidenceLevel.WEAK_EVIDENCE, gate.classify(rankOneEvidence(), atWeak));

        RelevanceSignals justBelowWeak = new RelevanceSignals(WEAK_SIMILARITY - 0.001, 0.1, 1.0, true);
        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(rankOneEvidence(), justBelowWeak));
    }
}
