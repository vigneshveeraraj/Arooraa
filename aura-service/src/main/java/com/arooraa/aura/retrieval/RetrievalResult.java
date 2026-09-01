package com.arooraa.aura.retrieval;

import java.util.List;

/**
 * {@code signals} carries the absolute relevance measurements the {@code evidenceLevel} was
 * derived from, so a future generation layer (and the calibration harness) can see <em>why</em> a
 * query was classified the way it was rather than having to trust the label.
 */
public record RetrievalResult(String query, EvidenceLevel evidenceLevel, RelevanceSignals signals,
                               List<Evidence> evidence) {

    public static RetrievalResult noEvidence(String query) {
        return new RetrievalResult(query, EvidenceLevel.NO_EVIDENCE, RelevanceSignals.none(), List.of());
    }
}
