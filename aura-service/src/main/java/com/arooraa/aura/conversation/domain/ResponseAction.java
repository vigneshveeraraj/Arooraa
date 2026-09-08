package com.arooraa.aura.conversation.domain;

/**
 * What this turn should <em>do</em>, as distinct from what it is about (A1.5).
 *
 * <p>{@link ConversationMode} has always answered "what kind of question is this?". It could not
 * answer "should we answer it yet?", and that gap is what produced the defect this milestone
 * exists for. Asked "can you help me guide how to code?", Aura gave a competent tutorial and named
 * three external learning platforms — because every turn in the pipeline had exactly one option
 * available to it, which was to answer. Nothing could say "I do not yet know what this person
 * wants."
 *
 * <p>Deliberately small. These are the shapes a turn can take, not a taxonomy of intents: the
 * subject stays in {@code ConversationMode}, the permissions stay in {@code GenerationDecision},
 * and adding a value here should mean the turn genuinely behaves differently, not that a new label
 * was wanted.
 */
public enum ResponseAction {

    /** Answer the question as asked. The default, and what every turn did before A1.5. */
    ANSWER,

    /**
     * Ask one natural question first, because the honest answer depends on something we do not
     * know yet. Reserved for ambiguity that actually changes the answer — someone who wants to
     * learn to code and someone who wants an application built are owed different conversations,
     * and guessing wrong wastes the turn for both of them.
     */
    CLARIFY,

    /** Draw out the problem: they are describing something they want built or fixed. */
    DISCOVER,

    /** Answer the technical question on its merits — the visitor's own system, or a concept. */
    CONSULT
}
