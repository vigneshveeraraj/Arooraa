package com.arooraa.aura.conversation.domain;

/**
 * The language/register Aura should reply in — matched to what the visitor actually wrote, with no
 * language selector anywhere in the UI.
 *
 * <p>{@link #TANGLISH} is deliberately its own value rather than "English": a visitor writing
 * "MESA restaurant-ku epdi help pannum?" is not writing English and does not want a formal Tamil
 * reply either. Answering in the same conversational Tanglish register is the natural response;
 * translating it into literary Tamil is not.
 */
public enum Language {

    ENGLISH,

    /** Tamil script. */
    TAMIL,

    /** Romanized Tamil, usually mixed with English words. */
    TANGLISH
}
