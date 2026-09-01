package com.arooraa.aura.conversation.pipeline;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Shared text normalization for the deterministic classifiers. Kept in one place so
 * "does this message mention MESA?" means exactly the same thing to the confidentiality
 * classifier, the scope classifier and the output guardrail — three components that must never
 * disagree about what a message says.
 */
public final class TextSignals {

    private TextSignals() {
    }

    /**
     * Lowercased, accent-stripped, punctuation-flattened, single-spaced, and padded with spaces at
     * both ends. The padding is what lets callers match whole words with {@code contains(" mesa ")}
     * without a regex per term — including at the very start and end of the message, which is
     * exactly where a one-word question like "MESA?" puts them.
     *
     * <p>Tamil script survives: NFKD splits its combining marks off and the mark-stripping leaves
     * the base letters, so Tamil words normalize consistently instead of vanishing.
     */
    public static String normalize(String text) {
        if (text == null) {
            return " ";
        }
        String lowered = Normalizer.normalize(text.toLowerCase(Locale.ROOT), Normalizer.Form.NFKD)
                .replaceAll("\\p{M}+", "");
        String flattened = lowered.replaceAll("[^\\p{L}\\p{Nd}]+", " ").trim();
        return " " + flattened + " ";
    }

    /** True if the normalized text contains any of these terms as whole words/phrases. */
    public static boolean containsAny(String normalized, Iterable<String> terms) {
        for (String term : terms) {
            if (normalized.contains(" " + term + " ")) {
                return true;
            }
        }
        return false;
    }
}
