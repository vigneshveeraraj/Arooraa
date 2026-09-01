package com.arooraa.aura.conversation.domain;

/**
 * What kind of turn this is — the routing decision every later stage reads (retrieval, grounding
 * policy, prompt composition, guardrail). Named in {@code 92-aura-conversation-policy.md} as the
 * design contract A0/A1 deferred; A3 implements it.
 *
 * <p>{@link #INTERNAL_BOUNDARY} is the safety-critical one: it is decided deterministically before
 * anything reaches the model (see {@code ConfidentialityClassifier}), because a confidentiality
 * boundary that depends on the model choosing to honour a prompt is not a boundary.
 */
public enum ConversationMode {

    /**
     * A greeting or social opener and nothing else — "Hi", "Vanakkam", "Hey Aura 😄".
     *
     * <p>Exists because the alternative is worse than untidy. Without it "Hey Aura" matched the
     * organisation-subject rule (Aura is one of the names it looks for), became a
     * {@link #GROUNDED_QA} question, and searched the knowledge base for a document about saying
     * hello — which returned the nearest vectors it could find and turned pure noise into
     * WEAK_EVIDENCE with citations attached. A hello is not a question about anything, so there is
     * nothing to retrieve and nothing to cite.
     *
     * <p>Narrow on purpose: an opener is social only when the <em>entire</em> message is one.
     * "Hi Aura, what is MESA?" is a question with a greeting on the front, and stays a question.
     */
    SOCIAL,

    /** An AROORAA-specific factual question — answerable only from approved retrieved evidence. */
    GROUNDED_QA,

    /** A technology/engineering question about the visitor's own system — general knowledge, no AROORAA claim. */
    GENERAL_CONSULTING,

    /** The visitor is exploring what an AROORAA product does for their situation. */
    PRODUCT_DISCOVERY,

    /** The visitor has an idea or a problem and is starting to describe a potential project. */
    PROJECT_DISCOVERY,

    /** "Where do I find X" — pointing at a page or a next step. */
    NAVIGATION,

    /** Jobs, hiring, internships, applying. */
    CAREERS,

    /** A question about AROORAA's own internal implementation. Answered warmly, never disclosed. */
    INTERNAL_BOUNDARY,

    /** General world information Aura is not here for (weather, sport, homework). */
    OUT_OF_SCOPE
}
