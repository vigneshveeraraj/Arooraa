package com.arooraa.aura.knowledge.domain;

/**
 * Who a document version is eligible to be shown to. Aura's public retrieval path (Phase A0/A1
 * security requirement) must only ever surface {@link #PUBLIC} content — this is enforced at the
 * repository query layer (see {@code AuraDocumentVersionRepository}), not only by prompting.
 */
public enum Visibility {
    /** Safe to surface to any website visitor via Aura. */
    PUBLIC,
    /** Internal reference material (e.g. an editorial draft note) — never retrievable by Aura. */
    INTERNAL
}
