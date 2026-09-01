package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.ProductStatus;
import com.arooraa.aura.knowledge.domain.Visibility;

/**
 * The result of parsing one knowledge-seed markdown file's frontmatter + body (see
 * {@code knowledge-seed/README.md}'s frontmatter schema). {@code knowledgeSpace} defaults to
 * {@code AROORAA_PUBLIC} when the source doesn't state one; Aura's own policy documents declare
 * {@code AURA_POLICY} so they stay outside ordinary public factual retrieval entirely.
 *
 * <p>{@code reviewStatus} is editorial, not retrieval-relevant: it says whether a human still owes
 * this document a look, and is deliberately absent from {@link DocumentFingerprint} so resolving a
 * review does not re-version unchanged content. It is read by the local knowledge bootstrap, which
 * refuses to index anything still marked {@code NEEDS_OWNER_APPROVAL}.
 */
public record ParsedKnowledgeDocument(
        String slug,
        String title,
        String domain,
        String category,
        String product,
        String service,
        Visibility visibility,
        ProductStatus productStatus,
        String knowledgeSpace,
        String source,
        String reviewStatus,
        String body) {

    /** Defaults {@code reviewStatus} to DRAFT — the seed's own default for an unmarked document. */
    public ParsedKnowledgeDocument(String slug, String title, String domain, String category, String product,
                                    String service, Visibility visibility, ProductStatus productStatus,
                                    String knowledgeSpace, String source, String body) {
        this(slug, title, domain, category, product, service, visibility, productStatus, knowledgeSpace,
                source, "DRAFT", body);
    }
}
