package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.KnowledgeSpaces;
import com.arooraa.aura.knowledge.domain.ProductStatus;
import com.arooraa.aura.knowledge.domain.Visibility;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

/**
 * Proves the A2.1 fingerprint fix: every retrieval-relevant field participates in document
 * identity, and nothing else does.
 */
class DocumentFingerprintTest {

    private static ParsedKnowledgeDocument document(String title, String domain, String category, String product,
                                                     String service, Visibility visibility, ProductStatus productStatus,
                                                     String knowledgeSpace, String source, String body) {
        return new ParsedKnowledgeDocument("10-mesa", title, domain, category, product, service,
                visibility, productStatus, knowledgeSpace, source, body);
    }

    private static ParsedKnowledgeDocument baseline() {
        return document("MESA", "product", "product-overview", "MESA", null, Visibility.PUBLIC,
                ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts", "# MESA\n\nBody content.");
    }

    @Test
    void identicalInputProducesIdenticalFingerprint() {
        assertEquals(DocumentFingerprint.of(baseline()), DocumentFingerprint.of(baseline()));
    }

    @Test
    void bodyChangeCreatesADifferentFingerprint() {
        ParsedKnowledgeDocument changed = document("MESA", "product", "product-overview", "MESA", null,
                Visibility.PUBLIC, ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts",
                "# MESA\n\nMaterially different body content.");

        assertNotEquals(DocumentFingerprint.of(baseline()), DocumentFingerprint.of(changed));
    }

    @Test
    void everyRetrievalRelevantMetadataFieldChangesTheFingerprint() {
        String base = DocumentFingerprint.of(baseline());

        assertNotEquals(base, DocumentFingerprint.of(document("MESA Platform", "product", "product-overview", "MESA",
                null, Visibility.PUBLIC, ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts",
                "# MESA\n\nBody content.")), "title is searched by lexical retrieval");

        assertNotEquals(base, DocumentFingerprint.of(document("MESA", "products", "product-overview", "MESA",
                null, Visibility.PUBLIC, ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts",
                "# MESA\n\nBody content.")), "domain");

        assertNotEquals(base, DocumentFingerprint.of(document("MESA", "product", "overview", "MESA",
                null, Visibility.PUBLIC, ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts",
                "# MESA\n\nBody content.")), "category");

        assertNotEquals(base, DocumentFingerprint.of(document("MESA", "product", "product-overview", "Mindra",
                null, Visibility.PUBLIC, ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts",
                "# MESA\n\nBody content.")), "product is searched by lexical retrieval");

        assertNotEquals(base, DocumentFingerprint.of(document("MESA", "product", "product-overview", "MESA",
                "Product Engineering", Visibility.PUBLIC, ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC,
                "products.ts", "# MESA\n\nBody content.")), "service is searched by lexical retrieval");

        assertNotEquals(base, DocumentFingerprint.of(document("MESA", "product", "product-overview", "MESA",
                null, Visibility.INTERNAL, ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts",
                "# MESA\n\nBody content.")), "visibility decides retrievability");

        assertNotEquals(base, DocumentFingerprint.of(document("MESA", "product", "product-overview", "MESA",
                null, Visibility.PUBLIC, ProductStatus.IN_DEVELOPMENT, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts",
                "# MESA\n\nBody content.")), "product status changes what Aura may claim");

        assertNotEquals(base, DocumentFingerprint.of(document("MESA", "product", "product-overview", "MESA",
                null, Visibility.PUBLIC, ProductStatus.AVAILABLE, KnowledgeSpaces.AURA_POLICY, "products.ts",
                "# MESA\n\nBody content.")), "knowledge space decides which corpus can see it");

        assertNotEquals(base, DocumentFingerprint.of(document("MESA", "product", "product-overview", "MESA",
                null, Visibility.PUBLIC, ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "about.ts",
                "# MESA\n\nBody content.")), "source URL is surfaced on evidence for citation");
    }

    @Test
    void lineEndingAndTrailingWhitespaceChangesDoNotReVersionContent() {
        ParsedKnowledgeDocument crlf = document("MESA", "product", "product-overview", "MESA", null,
                Visibility.PUBLIC, ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts",
                "# MESA\r\n\r\nBody content.   ");

        assertEquals(DocumentFingerprint.of(baseline()), DocumentFingerprint.of(crlf));
    }

    @Test
    void paragraphStructureIsPreservedBecauseItChangesChunking() {
        ParsedKnowledgeDocument oneParagraph = document("MESA", "product", "product-overview", "MESA", null,
                Visibility.PUBLIC, ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts",
                "# MESA\nBody content.");

        assertNotEquals(DocumentFingerprint.of(baseline()), DocumentFingerprint.of(oneParagraph));
    }

    @Test
    void fieldValuesCannotCollideAcrossFieldBoundaries() {
        ParsedKnowledgeDocument a = document("ab", "product", "product-overview", "c", null, Visibility.PUBLIC,
                ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts", "body");
        ParsedKnowledgeDocument b = document("a", "product", "product-overview", "bc", null, Visibility.PUBLIC,
                ProductStatus.AVAILABLE, KnowledgeSpaces.AROORAA_PUBLIC, "products.ts", "body");

        assertNotEquals(DocumentFingerprint.of(a), DocumentFingerprint.of(b));
    }
}
