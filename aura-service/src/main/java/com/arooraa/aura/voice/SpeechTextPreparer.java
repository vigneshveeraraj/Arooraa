package com.arooraa.aura.voice;

import org.springframework.stereotype.Component;

/**
 * Turns an answer Aura has already given into something worth listening to — deterministically,
 * and without a model anywhere in the path.
 *
 * <p>That constraint is the point. A second generation asked to "shorten this for speech" is a
 * second chance to invent an AROORAA fact, and it would be invisible: the visitor reads one
 * sentence on screen and hears a different one. Everything here is string work on text that has
 * already been generated, guardrailed and shown, so the spoken answer can only ever be the written
 * answer with its markup removed and, if it is very long, its later sentences left unread.
 *
 * <p>Two transformations, both boring on purpose:
 * <ul>
 *   <li>markup that exists for the eye is stripped — {@code **bold**} read aloud is "star star",
 *       and a bullet character becomes a pause rather than a word;</li>
 *   <li>the text is clamped to {@code aura.voice.synthesis.max-characters} at a sentence boundary,
 *       so a long grounded answer is spoken as far as it reads naturally instead of being cut
 *       mid-word. The full answer is on screen the whole time.</li>
 * </ul>
 */
@Component
public class SpeechTextPreparer {

    /** Where a sentence may end, for the purpose of clamping. */
    private static final char[] SENTENCE_ENDINGS = {'.', '!', '?', '…', '।'};

    /**
     * How far back from the limit we will look for a sentence boundary before giving up and
     * clamping at a word boundary instead. Beyond this the search costs more speech than it saves.
     */
    private static final double SENTENCE_SEARCH_WINDOW = 0.4;

    public String prepare(String answer, int maxCharacters) {
        if (answer == null || answer.isBlank()) return "";
        String spoken = stripMarkup(answer);
        if (maxCharacters <= 0 || spoken.length() <= maxCharacters) return spoken;
        return clamp(spoken, maxCharacters);
    }

    /**
     * Removes the small markdown subset Aura's answers use (see the frontend's rich-text parser —
     * bold, italic, inline code, bullets) and nothing else. Emphasis markers are dropped rather
     * than voiced; a bullet becomes a comma so a list is heard as a list rather than run together.
     */
    private String stripMarkup(String answer) {
        StringBuilder out = new StringBuilder(answer.length());
        for (String line : answer.split("\n", -1)) {
            String trimmed = line.strip();
            if (trimmed.isEmpty()) {
                appendSeparator(out, " ");
                continue;
            }
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
                appendSeparator(out, ", ");
                out.append(inline(trimmed.substring(2).strip()));
            } else {
                appendSeparator(out, " ");
                out.append(inline(trimmed));
            }
        }
        return out.toString().replaceAll("\\s{2,}", " ").strip();
    }

    private void appendSeparator(StringBuilder out, String separator) {
        if (out.isEmpty()) return;
        char last = out.charAt(out.length() - 1);
        if (last == ' ' || last == ',') return;
        out.append(separator);
    }

    /** Drops `*`, `_` and backticks used as emphasis, keeping the words between them. */
    private String inline(String text) {
        return text.replaceAll("\\*\\*([^*]+)\\*\\*", "$1")
                .replaceAll("`([^`]+)`", "$1")
                .replaceAll("\\*([^*\\n]+)\\*", "$1")
                .replaceAll("_([^_\\n]+)_", "$1");
    }

    private String clamp(String spoken, int maxCharacters) {
        String window = spoken.substring(0, maxCharacters);
        int floor = (int) (maxCharacters * (1 - SENTENCE_SEARCH_WINDOW));
        int best = -1;
        for (char ending : SENTENCE_ENDINGS) {
            int index = window.lastIndexOf(ending);
            if (index > best) best = index;
        }
        if (best >= floor) return window.substring(0, best + 1).strip();

        int lastSpace = window.lastIndexOf(' ');
        return (lastSpace > floor ? window.substring(0, lastSpace) : window).strip();
    }
}
