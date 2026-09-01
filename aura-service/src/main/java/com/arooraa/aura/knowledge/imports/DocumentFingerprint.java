package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.support.Sha256;

/**
 * The fingerprint that decides whether an import creates a new {@code AuraDocumentVersion}.
 *
 * <p>A2 hashed the raw source file, which had two problems: a pure line-ending change re-versioned
 * content that hadn't actually changed, and — worse — nothing guaranteed the fields that actually
 * affect retrieval were part of the identity at all. A2.1 fixes this by hashing an explicit,
 * normalized, field-labelled projection of exactly the retrieval-relevant metadata plus the body:
 *
 * <ul>
 *   <li>{@code title}, {@code product}, {@code service} — searched directly by lexical retrieval;</li>
 *   <li>{@code domain}, {@code category} — retrieval/filtering metadata carried on the document;</li>
 *   <li>{@code sourceUrl} — surfaced on evidence for citation;</li>
 *   <li>{@code visibility}, {@code knowledgeSpace} — decide whether the content is retrievable at
 *       all, so a change here must be a new, separately-approvable version;</li>
 *   <li>{@code productStatus} — changes what Aura may claim about a product's availability;</li>
 *   <li>the body itself, which is what gets chunked and embedded.</li>
 * </ul>
 *
 * <p>Deliberately excluded: {@code review_status} (an editorial workflow note about the source
 * file, not content Aura ever retrieves — changing it must not force re-approval and re-embedding
 * of unchanged content).
 *
 * <p>Field values are length-prefixed so no combination of values can collide by concatenation
 * (e.g. title "a" + product "bc" can never hash the same as title "ab" + product "c").
 */
public final class DocumentFingerprint {

    private DocumentFingerprint() {
    }

    public static String of(ParsedKnowledgeDocument document) {
        StringBuilder canonical = new StringBuilder();
        append(canonical, "title", document.title());
        append(canonical, "domain", document.domain());
        append(canonical, "category", document.category());
        append(canonical, "product", document.product());
        append(canonical, "service", document.service());
        append(canonical, "sourceUrl", document.source());
        append(canonical, "visibility", document.visibility() == null ? null : document.visibility().name());
        append(canonical, "productStatus", document.productStatus() == null ? null : document.productStatus().name());
        append(canonical, "knowledgeSpace", document.knowledgeSpace());
        append(canonical, "body", normalizeBody(document.body()));
        return Sha256.hex(canonical.toString());
    }

    /**
     * Normalizes line endings and trailing per-line whitespace only. Paragraph structure is
     * deliberately preserved — blank lines drive {@code ChunkingService}'s paragraph packing, so
     * collapsing them would hide a change that really does alter the chunks and their embeddings.
     */
    static String normalizeBody(String body) {
        if (body == null) {
            return "";
        }
        String[] lines = body.replace("\r\n", "\n").replace('\r', '\n').split("\n", -1);
        StringBuilder normalized = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            if (i > 0) {
                normalized.append('\n');
            }
            normalized.append(stripTrailing(lines[i]));
        }
        return normalized.toString().strip();
    }

    private static String stripTrailing(String line) {
        int end = line.length();
        while (end > 0 && Character.isWhitespace(line.charAt(end - 1))) {
            end--;
        }
        return line.substring(0, end);
    }

    private static void append(StringBuilder canonical, String field, String value) {
        String normalized = value == null ? "" : value.strip();
        canonical.append(field).append(':').append(normalized.length()).append(':').append(normalized).append('\n');
    }
}
