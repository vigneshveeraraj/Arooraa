package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.ProductStatus;
import com.arooraa.aura.knowledge.domain.Visibility;

/**
 * The result of parsing one knowledge-seed markdown file's frontmatter + body (see
 * {@code knowledge-seed/README.md}'s frontmatter schema). {@code knowledgeSpace} defaults to
 * {@code AROORAA_PUBLIC} when the source doesn't state one; Aura's own policy documents declare
 * {@code AURA_POLICY} so they stay outside ordinary public factual retrieval entirely.
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
        String body) {
}
