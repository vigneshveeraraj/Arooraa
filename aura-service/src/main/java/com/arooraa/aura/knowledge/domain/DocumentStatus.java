package com.arooraa.aura.knowledge.domain;

/**
 * Lifecycle of one {@link AuraDocumentVersion}: {@code DRAFT} → {@code IN_REVIEW} →
 * {@code APPROVED} → {@code INDEXED}, with {@code ARCHIVED} for a version superseded by a newer
 * one (kept for audit, never active, never retrievable).
 *
 * <p>Deliberately folds "approval" into this single lifecycle rather than a parallel
 * approval-status field — a version's state already says whether it's approved, and a second
 * enum tracking the same fact would just be two sources of truth to keep in sync.
 *
 * <p>Retrieval eligibility (see {@code AuraDocumentVersionRepository}) requires
 * {@code status = INDEXED} — approval alone is not enough, because an approved version whose
 * chunks/embeddings haven't been generated yet has nothing for retrieval to return.
 */
public enum DocumentStatus {
    /** Editorial draft — not reviewed, never retrievable. */
    DRAFT,
    /** Submitted for owner review. */
    IN_REVIEW,
    /** Owner-approved content, correct and ready to publish — chunking/embedding not run yet. */
    APPROVED,
    /** Approved AND successfully chunked/embedded — the only status eligible for retrieval. */
    INDEXED,
    /** Superseded by a newer version of the same document; retained for audit only. */
    ARCHIVED
}
