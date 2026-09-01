package com.arooraa.aura.knowledge.domain;

/**
 * Real-world delivery status of a product or capability a document describes — separate from
 * {@link DocumentStatus} (which tracks the *document's own* editorial lifecycle, not the thing
 * it describes). Aura must never present {@code PLANNED}/{@code PROTOTYPE}/{@code CONCEPT}
 * capabilities as already delivered (frozen product definition, hallucination policy).
 *
 * <p>Nullable on {@link AuraDocumentVersion} — only meaningful for documents that describe a
 * product/service capability; company-overview or policy documents leave it unset.
 */
public enum ProductStatus {
    /** Live and usable today. */
    AVAILABLE,
    /** Live for a limited audience or with known rough edges. */
    BETA,
    /** Actively being built; not yet usable by customers. */
    IN_DEVELOPMENT,
    /** A working proof of concept; not production-track yet. */
    PROTOTYPE,
    /** Committed direction, not started. */
    PLANNED,
    /** An idea/direction under consideration, not committed. */
    CONCEPT
}
