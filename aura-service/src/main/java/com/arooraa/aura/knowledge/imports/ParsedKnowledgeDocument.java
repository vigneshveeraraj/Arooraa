package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.ProductStatus;
import com.arooraa.aura.knowledge.domain.Visibility;

/** The result of parsing one knowledge-seed markdown file's frontmatter + body (see {@code knowledge-seed/README.md}'s frontmatter schema). */
public record ParsedKnowledgeDocument(
        String slug,
        String title,
        String domain,
        String category,
        String product,
        String service,
        Visibility visibility,
        ProductStatus productStatus,
        String source,
        String body) {
}
