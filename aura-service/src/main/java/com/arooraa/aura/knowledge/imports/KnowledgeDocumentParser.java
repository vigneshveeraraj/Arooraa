package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.KnowledgeSpaces;
import com.arooraa.aura.knowledge.domain.ProductStatus;
import com.arooraa.aura.knowledge.domain.Visibility;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Hand-written frontmatter parser rather than a YAML library dependency — the knowledge-seed
 * schema (see {@code knowledge-seed/README.md}) is a small, fixed, flat set of {@code key: value}
 * scalars with no nesting, so a full YAML parser buys nothing and this stays fully inspectable.
 * Rejects malformed documents safely: any structural or required-field problem throws
 * {@link MalformedKnowledgeDocumentException} rather than importing partial/guessed content.
 */
@Component
public class KnowledgeDocumentParser {

    private static final Pattern FRONTMATTER = Pattern.compile("\\A---\\r?\\n(.*?)\\r?\\n---\\r?\\n(.*)", Pattern.DOTALL);
    private static final Set<String> VALID_REVIEW_STATUSES = Set.of("DRAFT", "NEEDS_OWNER_APPROVAL", "OWNER_APPROVED");

    public ParsedKnowledgeDocument parse(String sourceIdentifier, String fileContent) {
        Matcher matcher = FRONTMATTER.matcher(fileContent);
        if (!matcher.matches()) {
            throw new MalformedKnowledgeDocumentException(
                    "Missing or malformed frontmatter delimiters (---) in " + sourceIdentifier);
        }

        Map<String, String> fields = parseFields(matcher.group(1), sourceIdentifier);
        String body = matcher.group(2).trim();
        if (body.isEmpty()) {
            throw new MalformedKnowledgeDocumentException("Empty body content in " + sourceIdentifier);
        }

        String slug = requireField(fields, "slug", sourceIdentifier);
        String title = requireField(fields, "title", sourceIdentifier);
        Visibility visibility = parseVisibility(fields.get("visibility"), sourceIdentifier);
        ProductStatus productStatus = parseProductStatus(fields.get("product_status"), sourceIdentifier);
        validateReviewStatus(fields.get("review_status"), sourceIdentifier);

        String knowledgeSpace = nullable(fields.get("knowledge_space"));

        return new ParsedKnowledgeDocument(
                slug, title,
                nullable(fields.get("domain")), nullable(fields.get("category")),
                nullable(fields.get("product")), nullable(fields.get("service")),
                visibility, productStatus,
                knowledgeSpace == null ? KnowledgeSpaces.AROORAA_PUBLIC : knowledgeSpace,
                nullable(fields.get("source")), body);
    }

    private Map<String, String> parseFields(String frontmatter, String sourceIdentifier) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (String line : frontmatter.split("\\r?\\n")) {
            if (line.isBlank()) {
                continue;
            }
            int colon = line.indexOf(':');
            if (colon < 0) {
                throw new MalformedKnowledgeDocumentException(
                        "Malformed frontmatter line \"" + line + "\" in " + sourceIdentifier);
            }
            fields.put(line.substring(0, colon).trim(), line.substring(colon + 1).trim());
        }
        return fields;
    }

    private String requireField(Map<String, String> fields, String key, String sourceIdentifier) {
        String value = nullable(fields.get(key));
        if (value == null) {
            throw new MalformedKnowledgeDocumentException(
                    "Missing required frontmatter field \"" + key + "\" in " + sourceIdentifier);
        }
        return value;
    }

    private Visibility parseVisibility(String raw, String sourceIdentifier) {
        String value = nullable(raw);
        if (value == null) {
            throw new MalformedKnowledgeDocumentException(
                    "Missing required frontmatter field \"visibility\" in " + sourceIdentifier);
        }
        try {
            return Visibility.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new MalformedKnowledgeDocumentException("Invalid visibility \"" + value + "\" in " + sourceIdentifier);
        }
    }

    private ProductStatus parseProductStatus(String raw, String sourceIdentifier) {
        String value = nullable(raw);
        if (value == null) {
            return null;
        }
        try {
            return ProductStatus.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new MalformedKnowledgeDocumentException("Invalid product_status \"" + value + "\" in " + sourceIdentifier);
        }
    }

    private void validateReviewStatus(String raw, String sourceIdentifier) {
        String value = nullable(raw);
        if (value != null && !VALID_REVIEW_STATUSES.contains(value.toUpperCase(Locale.ROOT))) {
            throw new MalformedKnowledgeDocumentException("Invalid review_status \"" + value + "\" in " + sourceIdentifier);
        }
    }

    private static String nullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty() || trimmed.equalsIgnoreCase("null")) {
            return null;
        }
        if (trimmed.length() >= 2 && isQuoted(trimmed)) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed;
    }

    private static boolean isQuoted(String value) {
        char first = value.charAt(0);
        char last = value.charAt(value.length() - 1);
        return (first == '"' && last == '"') || (first == '\'' && last == '\'');
    }
}
