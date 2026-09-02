package com.arooraa.aura.conversation.pipeline;

import java.util.List;

/**
 * Recognises a question that only makes sense next to a page — "tell me more about this" names
 * nothing on its own, and only becomes answerable once {@link PageContextRegistry} has resolved
 * what "this" is standing in for.
 *
 * <p>Matched as short fragments rather than whole sentences, the same way {@link TextSignals}
 * matches everywhere else: "this help" alone covers "how can this help me", "how could this help
 * my existing software" and every other phrasing a visitor actually types, without a combinatorial
 * list of full sentences. The word-boundary padding in {@link TextSignals#containsAny} keeps this
 * from over-matching — "this helps" (not "help") does not contain the padded term " this help ".
 *
 * <p>This detector never widens what a turn may see by itself. It only ever feeds
 * {@code PageAwareScopeResolver}, which additionally requires a message that would otherwise fall
 * through to {@code GENERAL_CONSULTING} <em>and</em> a page that resolves to a known subject.
 */
final class ContextualReferenceDetector {

    private static final List<String> CONTEXTUAL_FRAGMENTS = List.of(
            "tell me more", "more about this", "more about it",
            "what does this do", "what does it do",
            "how does this work", "how does it work", "does this work", "does it work",
            "this help", "it help",
            "this suitable", "suitable for my business",
            "its benefits", "the benefits",
            "can i use this", "use this for",
            "explain this",
            "about this product", "about this service",
            "what is this", "what s this");

    private ContextualReferenceDetector() {
    }

    static boolean isContextualReference(String message) {
        String normalized = TextSignals.normalize(message);
        return TextSignals.containsAny(normalized, CONTEXTUAL_FRAGMENTS);
    }
}
