package com.arooraa.aura.retrieval;

import com.arooraa.aura.retrieval.config.RetrievalProperties;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * The A2.1 contract: confidence comes from absolute relevance, never from RRF rank or score.
 * Thresholds here mirror application.yml's calibrated defaults.
 */
class EvidenceGateServiceTest {

    private static final double STRONG_SIMILARITY = 0.42;
    private static final double WEAK_SIMILARITY = 0.28;
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
        // Agreement corroborates a decision the absolute signals support; it must not create one.
        RelevanceSignals agreeingButIrrelevant = new RelevanceSignals(0.12, 0.02, 0.0, true);

        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(rankOneEvidence(), agreeingButIrrelevant));
    }

    @Test
    void strongSimilarityWithCorroborationProducesStrongEvidence() {
        RelevanceSignals strong = new RelevanceSignals(0.55, 0.3, 0.5, true);

        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(rankOneEvidence(), strong));
    }

    @Test
    void strongSimilarityWithHighCoverageProducesStrongEvidenceWithoutAgreement() {
        RelevanceSignals strong = new RelevanceSignals(0.50, 0.3, 0.80, false);

        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(rankOneEvidence(), strong));
    }

    @Test
    void strongSimilarityAloneIsOnlyWeakWithoutCorroboration() {
        // Embeddings rate a topically-adjacent passage highly even when it doesn't answer the
        // question — the confidentiality failure mode — so similarity alone stops at WEAK.
        RelevanceSignals uncorroborated = new RelevanceSignals(0.50, null, 0.20, false);

        assertEquals(EvidenceLevel.WEAK_EVIDENCE, gate.classify(rankOneEvidence(), uncorroborated));
    }

    @Test
    void borderlineSimilarityProducesWeakEvidence() {
        RelevanceSignals borderline = new RelevanceSignals(0.35, 0.1, 0.5, true);

        assertEquals(EvidenceLevel.WEAK_EVIDENCE, gate.classify(rankOneEvidence(), borderline));
    }

    @Test
    void lowAbsoluteSimilarityAndLowCoverageProducesNoEvidence() {
        RelevanceSignals none = new RelevanceSignals(0.20, 0.0, 0.10, false);

        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(rankOneEvidence(), none));
    }

    @Test
    void nearlyExactLexicalMatchCanCarryStrongEvidenceWithMidRangeSimilarity() {
        // Exact-terminology questions: the passage literally answers the words asked, and there is
        // at least some semantic support.
        RelevanceSignals lexicallyExact = new RelevanceSignals(0.30, 0.6, 1.0, true);

        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(rankOneEvidence(), lexicallyExact));
    }

    @Test
    void lexicalSupportContradictedByNearZeroSimilarityStaysBelowStrong() {
        // Words match but the embedding says the passage is not about the question — e.g. a
        // confidentiality probe whose terms appear in a "what Aura must not disclose" section.
        // There IS a real lexical signal, so NO_EVIDENCE would overstate; WEAK is the honest
        // answer, and WEAK still forbids a confident AROORAA-specific claim.
        RelevanceSignals contradicted = new RelevanceSignals(0.05, 0.6, 1.0, true);

        assertEquals(EvidenceLevel.WEAK_EVIDENCE, gate.classify(rankOneEvidence(), contradicted));
    }

    @Test
    void lexicalSignalAloneCanReachWeakWhenVectorSearchDidNotRun() {
        // No embedding provider configured: similarity is null, so only coverage can speak.
        RelevanceSignals lexicalOnly = new RelevanceSignals(null, 0.4, 0.60, false);

        assertEquals(EvidenceLevel.WEAK_EVIDENCE, gate.classify(rankOneEvidence(), lexicalOnly));
    }

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
        RelevanceSignals atStrong = new RelevanceSignals(STRONG_SIMILARITY, 0.3, STRONG_COVERAGE, false);
        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(rankOneEvidence(), atStrong));

        RelevanceSignals atWeak = new RelevanceSignals(WEAK_SIMILARITY, 0.1, 0.0, false);
        assertEquals(EvidenceLevel.WEAK_EVIDENCE, gate.classify(rankOneEvidence(), atWeak));
    }
}
