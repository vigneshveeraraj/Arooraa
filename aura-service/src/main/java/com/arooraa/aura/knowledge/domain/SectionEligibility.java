package com.arooraa.aura.knowledge.domain;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Whether a section of a document is visitor-facing knowledge.
 *
 * <p>A PUBLIC document is not automatically public all the way down. Several seed documents carry
 * a section addressed to Aura rather than to a reader — {@code ## What Aura must not disclose about
 * MESA}, {@code ## Aura's role in this flow} — and those sections are operating guidance, not
 * evidence. Left eligible they behave exactly as badly as you would expect: A3.2's first real
 * conversation answered "What about MESA" with a citation reading "What Aura must not disclose
 * about MESA", and the same sections name internal policy filenames in their body.
 *
 * <p>The mechanism is exclusion at chunking time, so an ineligible section produces no chunk at
 * all. That matters more than it sounds: a chunk that does not exist cannot be retrieved, cannot
 * reach the prompt, and cannot be cited — whereas hiding one at the API layer would leave the
 * model still reading confidentiality instructions as though they were facts about MESA.
 *
 * <p>Two ways a section becomes ineligible, and the order is deliberate:
 * <ol>
 *   <li>An explicit {@code <!-- retrievable: false -->} marker under the heading. This is the
 *       mechanism authors should use, it is greppable, and it survives a heading being reworded.</li>
 *   <li>A heading that addresses the assistant. This is a backstop for content written before the
 *       marker existed, or by someone who did not know about it. It is narrow on purpose — the
 *       test is whether a heading gives Aura an instruction, which no genuinely visitor-facing
 *       heading does — and it fails in the safe direction: the cost of a false positive is one
 *       section not used as evidence.</li>
 * </ol>
 */
public final class SectionEligibility {

    private SectionEligibility() {
    }

    /** The explicit author marker. Placed immediately under the heading it applies to. */
    private static final Pattern NOT_RETRIEVABLE_MARKER =
            Pattern.compile("(?i)<!--\\s*retrievable\\s*:\\s*false\\b");

    /**
     * Editorial notes to a human reviewer — {@code <!-- NEEDS_OWNER_APPROVAL: ... -->} and the
     * marker above. Review metadata is not content, so it is removed from chunk text rather than
     * embedded, retrieved and quoted back at a visitor.
     */
    private static final Pattern EDITORIAL_COMMENT = Pattern.compile("(?s)<!--.*?-->");

    /**
     * Cross-references between seed files, which read like {@code (`91-aura-confidentiality-and-safety.md`)}.
     * They are an editor's pointer from one source document to another, and they name internal
     * policy documents — neither of which belongs in text a visitor can be shown.
     */
    private static final Pattern SEED_REFERENCE_IN_PARENTHESES =
            Pattern.compile("\\s*\\(\\s*`\\d{2}-[a-z0-9-]+\\.md`\\s*\\)");
    private static final Pattern SEED_REFERENCE = Pattern.compile("`\\d{2}-[a-z0-9-]+\\.md`");

    /** Words that, next to "Aura", make a heading an instruction rather than a subject. */
    private static final List<String> INSTRUCTION_WORDS = List.of(
            "must", "never", "cannot", "can not", "may not", "should", "role", "disclose",
            "is allowed", "responsibilities");

    /** Control vocabulary that is an instruction no matter whose name is attached. */
    private static final List<String> CONTROL_PHRASES = List.of(
            "must not disclose", "must never disclose", "confidentiality instruction",
            "internal guidance", "internal instruction", "prompt policy", "system prompt",
            "assistant instruction", "guardrail", "policy rules", "operating rules");

    /**
     * True when this section may become a retrievable chunk.
     *
     * @param heading the section's heading, or null for a document preamble
     * @param body the section's raw body text, where an explicit marker would live
     */
    public static boolean isRetrievable(String heading, String body) {
        if (body != null && NOT_RETRIEVABLE_MARKER.matcher(body).find()) {
            return false;
        }
        return !isAssistantControlHeading(heading);
    }

    /**
     * True when a heading is written at Aura rather than at a reader.
     *
     * <p>Also consulted on the retrieval path, so a chunk indexed before this rule existed — the
     * ones already sitting in the owner's local database — stops being usable as evidence
     * immediately, without waiting for a re-ingestion.
     */
    public static boolean isAssistantControlHeading(String heading) {
        if (heading == null || heading.isBlank()) {
            return false;
        }
        String text = heading.toLowerCase(Locale.ROOT);
        for (String phrase : CONTROL_PHRASES) {
            if (text.contains(phrase)) {
                return true;
            }
        }
        if (!text.contains("aura")) {
            return false;
        }
        for (String word : INSTRUCTION_WORDS) {
            if (text.contains(word)) {
                return true;
            }
        }
        return false;
    }

    /**
     * The text with the editorial apparatus of a seed file removed — reviewer comments and
     * pointers between seed documents. None of it is content, and a chunk is the last point where
     * removing it is cheap: after this the text is embedded, retrieved, put in a prompt and
     * potentially quoted.
     */
    public static String stripEditorialMarkup(String text) {
        if (text == null) {
            return null;
        }
        String cleaned = EDITORIAL_COMMENT.matcher(text).replaceAll("");
        cleaned = SEED_REFERENCE_IN_PARENTHESES.matcher(cleaned).replaceAll("");
        cleaned = SEED_REFERENCE.matcher(cleaned).replaceAll("");
        return cleaned.replaceAll("[ \\t]{2,}", " ");
    }
}
