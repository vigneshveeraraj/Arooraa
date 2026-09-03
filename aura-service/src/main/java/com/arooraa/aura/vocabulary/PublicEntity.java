package com.arooraa.aura.vocabulary;

import java.util.List;

/**
 * One approved AROORAA public entity, and the written forms speech-to-text is known or likely to
 * produce for it.
 *
 * <p>Only public entities belong here. This registry is a recognition aid, not a knowledge source:
 * resolving a word to {@code MESA} decides nothing about what Aura may then say, because the answer
 * still comes from the approved corpus through the ordinary evidence gate.
 *
 * @param canonicalName exactly how AROORAA writes it, and what a resolved mention is rewritten to
 * @param forms every spelling that may be recognised as this entity, canonical spelling included
 */
public record PublicEntity(String canonicalName, List<Form> forms) {

    /**
     * How safe a spelling is to act on by itself.
     *
     * <p>The distinction is the whole of this milestone's false-positive protection. "Meesa" is not
     * a word anybody types on purpose, so seeing it is evidence in itself. "Mesa" is an ordinary
     * noun in Spanish and Portuguese and a landform in English — the owner's own counterexample, "I
     * want a mesa in my dining room", is exactly that — so seeing it is evidence of nothing until
     * the surrounding sentence says it is about a product.
     */
    public enum Certainty {
        /** Not an ordinary word. Recognised on its own. */
        DISTINCTIVE,
        /** Also an ordinary word, or a common name. Recognised only with contextual support. */
        EVERYDAY,
    }

    /**
     * @param words the spelling, written the way a person writes it and normalized once on load —
     *        so a form may be several words ("smart mirror") and is matched at word boundaries
     */
    public record Form(String words, Certainty certainty) {
    }

    static PublicEntity of(String canonicalName, Form... forms) {
        return new PublicEntity(canonicalName, List.of(forms));
    }

    static Form distinctive(String words) {
        return new Form(words, Certainty.DISTINCTIVE);
    }

    static Form everyday(String words) {
        return new Form(words, Certainty.EVERYDAY);
    }
}
