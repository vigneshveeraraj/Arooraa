package com.arooraa.aura.insight.domain;

/**
 * The things worth counting. A closed set on purpose: an analytics table whose event names are
 * free strings becomes a place where anything can be written, and eventually something is.
 *
 * <p>Every name here describes something Aura or a visitor <em>did</em>, never something either of
 * them said. What was asked lives in the transcript; how well it went lives here.
 */
public enum AuraEventType {

    CONVERSATION_STARTED,

    /** One answered turn. Carries mode, evidence level, language, page subject and latency. */
    MESSAGE_ANSWERED,

    /** The output guardrail replaced an answer. `detail` is the violation code. */
    GUARDRAIL_INTERVENED,

    /** A provider call failed and the visitor got a fallback. `detail` is transient/permanent. */
    PROVIDER_FAILED,

    VOICE_TRANSCRIBED,
    VOICE_TRANSCRIPTION_FAILED,
    VOICE_SPOKEN,
    VOICE_SYNTHESIS_FAILED,

    PROJECT_DISCOVERY_STARTED,
    PROJECT_BRIEF_SUMMARISED,
    PROJECT_HANDOFF_OFFERED,
    PROJECT_HANDOFF_REFUSED,
    PROJECT_HANDOFF_CREATED,

    KNOWLEDGE_GAP_RECORDED,
    FEEDBACK_GIVEN
}
