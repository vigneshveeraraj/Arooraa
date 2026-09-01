package com.arooraa.aura.retrieval;

/**
 * How much trust the top-ranked evidence for a query deserves — the gate a future chat-generation
 * layer must consult before making an AROORAA-specific claim (see
 * {@code 95-aura-unknown-answer-policy.md}: "no approved evidence → no claim"). Thresholds
 * classifying WEAK vs STRONG are provisional/configurable (see {@code RetrievalProperties}).
 */
public enum EvidenceLevel {
    /** No eligible evidence was found at all. */
    NO_EVIDENCE,
    /** Evidence exists but its relevance score is below the confident-answer threshold. */
    WEAK_EVIDENCE,
    /** Evidence exists with a relevance score confident enough to found a specific claim on. */
    STRONG_EVIDENCE
}
