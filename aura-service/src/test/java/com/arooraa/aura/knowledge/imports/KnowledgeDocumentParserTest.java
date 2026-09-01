package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.ProductStatus;
import com.arooraa.aura.knowledge.domain.Visibility;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class KnowledgeDocumentParserTest {

    private final KnowledgeDocumentParser parser = new KnowledgeDocumentParser();

    private static final String VALID = """
            ---
            slug: 10-mesa
            title: MESA
            domain: product
            category: product-overview
            product: MESA
            service: null
            visibility: PUBLIC
            product_status: AVAILABLE
            review_status: DRAFT
            source: frontend-v2/src/lib/content/about.ts
            ---

            # MESA

            MESA is AROORAA's flagship product.
            """;

    @Test
    void parsesAllFrontmatterFieldsAndBody() {
        ParsedKnowledgeDocument parsed = parser.parse("10-mesa.md", VALID);

        assertEquals("10-mesa", parsed.slug());
        assertEquals("MESA", parsed.title());
        assertEquals("product", parsed.domain());
        assertEquals("product-overview", parsed.category());
        assertEquals("MESA", parsed.product());
        assertNull(parsed.service());
        assertEquals(Visibility.PUBLIC, parsed.visibility());
        assertEquals(ProductStatus.AVAILABLE, parsed.productStatus());
        assertEquals("frontend-v2/src/lib/content/about.ts", parsed.source());
        assertEquals("# MESA\n\nMESA is AROORAA's flagship product.", parsed.body());
    }

    @Test
    void missingFrontmatterDelimitersIsRejected() {
        assertThrows(MalformedKnowledgeDocumentException.class,
                () -> parser.parse("bad.md", "# Just a heading\n\nNo frontmatter at all."));
    }

    @Test
    void missingRequiredSlugIsRejected() {
        String content = """
                ---
                title: MESA
                visibility: PUBLIC
                ---

                Body content.
                """;
        assertThrows(MalformedKnowledgeDocumentException.class, () -> parser.parse("bad.md", content));
    }

    @Test
    void missingVisibilityIsRejected() {
        String content = """
                ---
                slug: x
                title: X
                ---

                Body content.
                """;
        assertThrows(MalformedKnowledgeDocumentException.class, () -> parser.parse("bad.md", content));
    }

    @Test
    void invalidVisibilityValueIsRejected() {
        String content = """
                ---
                slug: x
                title: X
                visibility: SECRET
                ---

                Body content.
                """;
        assertThrows(MalformedKnowledgeDocumentException.class, () -> parser.parse("bad.md", content));
    }

    @Test
    void invalidProductStatusValueIsRejected() {
        String content = """
                ---
                slug: x
                title: X
                visibility: PUBLIC
                product_status: SHIPPED_YESTERDAY
                ---

                Body content.
                """;
        assertThrows(MalformedKnowledgeDocumentException.class, () -> parser.parse("bad.md", content));
    }

    @Test
    void emptyBodyIsRejected() {
        String content = """
                ---
                slug: x
                title: X
                visibility: PUBLIC
                ---

                """;
        assertThrows(MalformedKnowledgeDocumentException.class, () -> parser.parse("bad.md", content));
    }

    @Test
    void malformedFrontmatterLineWithoutColonIsRejected() {
        String content = """
                ---
                slug: x
                this line has no colon
                visibility: PUBLIC
                ---

                Body content.
                """;
        assertThrows(MalformedKnowledgeDocumentException.class, () -> parser.parse("bad.md", content));
    }
}
