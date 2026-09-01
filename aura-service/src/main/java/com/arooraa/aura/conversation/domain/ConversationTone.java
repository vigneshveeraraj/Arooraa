package com.arooraa.aura.conversation.domain;

/**
 * A lightweight read of how the visitor sounds, used to steer delivery only — never content,
 * never a boundary. Detected deterministically from the message text ({@code ToneDetector}), not
 * by a separate model call: an extra LLM round-trip per turn purely for emotion would double
 * latency and cost for a signal that only adjusts phrasing.
 *
 * @see #suppressesHumour()
 */
public enum ConversationTone {

    NEUTRAL,
    CURIOUS,
    HAPPY,
    EXCITED,
    CONFUSED,
    FRUSTRATED,
    SERIOUS,
    TECHNICAL,
    CASUAL;

    /**
     * Humour is disabled entirely for these, per {@code 90-aura-personality.md}: a joke landing on
     * a frustrated visitor or a security/legal/incident conversation reads as dismissive, and the
     * cost of being too flat there is far lower than the cost of being flippant.
     */
    public boolean suppressesHumour() {
        return this == FRUSTRATED || this == SERIOUS || this == CONFUSED;
    }
}
