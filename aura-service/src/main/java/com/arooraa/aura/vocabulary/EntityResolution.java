package com.arooraa.aura.vocabulary;

import java.util.List;

/**
 * What {@link PublicEntityResolver} made of one piece of text: the text as it arrived, the same
 * text with recognised public entities written the way AROORAA writes them, and which entities
 * those were.
 *
 * <p>Both texts are kept because they answer different questions. {@code rawText} is what the
 * visitor said or typed, and it is what stays true — the transcript, the message stored against the
 * conversation, and the turn the model is shown are all built from it. {@code canonicalText} is
 * what the deterministic stages read, so "tell me about meesa" reaches scope classification and
 * retrieval as a question about MESA.
 *
 * @param rawText exactly what arrived
 * @param canonicalText the same text with resolved mentions rewritten; identical to {@code rawText}
 *        when nothing was resolved
 * @param mentions the public entities recognised, in the order they appeared
 */
public record EntityResolution(String rawText, String canonicalText, List<Mention> mentions) {

    /**
     * @param canonicalName the approved spelling this was resolved to
     * @param matchedText the visitor's own words that were recognised
     * @param confidence internal only. It exists so the threshold that governs a rewrite is one
     *        number in one place rather than a scatter of conditions, and so a borderline decision
     *        can be reasoned about later. It is never returned to a browser, never logged beside a
     *        visitor's words, and never rendered — a visitor being told an assistant was "82% sure"
     *        what they meant would be an odd and slightly unnerving thing to read.
     */
    public record Mention(String canonicalName, String matchedText, double confidence) {
    }

    static EntityResolution unchanged(String text) {
        return new EntityResolution(text, text, List.of());
    }

    /** True when at least one mention was strong enough to rewrite. */
    public boolean changed() {
        return !mentions.isEmpty();
    }

    /** The canonical names alone, which is the only part of this safe to put in a log line. */
    public List<String> canonicalNames() {
        return mentions.stream().map(Mention::canonicalName).distinct().toList();
    }
}
