package com.arooraa.aura.retrieval;

import com.arooraa.aura.retrieval.config.RetrievalProperties;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class EvidenceGateServiceTest {

    private final EvidenceGateService gate = new EvidenceGateService(
            new RetrievalProperties(20, 8, 60, new RetrievalProperties.Evidence(0.5, 0.15)));

    private static Evidence evidenceWithScore(double normalizedScore) {
        return new Evidence(UUID.randomUUID(), "slug", "Title", UUID.randomUUID(), 1,
                UUID.randomUUID(), 0, null, null, "text",
                1, 0.9, 1, 0.8, 1, 0.02, normalizedScore);
    }

    @Test
    void emptyEvidenceIsNoEvidence() {
        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(List.of()));
    }

    @Test
    void topScoreAtOrAboveStrongThresholdIsStrongEvidence() {
        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(List.of(evidenceWithScore(0.5))));
        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(List.of(evidenceWithScore(0.9))));
    }

    @Test
    void topScoreBetweenWeakAndStrongIsWeakEvidence() {
        assertEquals(EvidenceLevel.WEAK_EVIDENCE, gate.classify(List.of(evidenceWithScore(0.15))));
        assertEquals(EvidenceLevel.WEAK_EVIDENCE, gate.classify(List.of(evidenceWithScore(0.3))));
    }

    @Test
    void topScoreBelowWeakThresholdIsNoEvidenceEvenThoughResultsExist() {
        assertEquals(EvidenceLevel.NO_EVIDENCE, gate.classify(List.of(evidenceWithScore(0.01))));
    }

    @Test
    void onlyTheTopRankedScoreIsConsidered() {
        Evidence strong = evidenceWithScore(0.9);
        Evidence weak = evidenceWithScore(0.01);

        assertEquals(EvidenceLevel.STRONG_EVIDENCE, gate.classify(List.of(strong, weak)));
    }
}
