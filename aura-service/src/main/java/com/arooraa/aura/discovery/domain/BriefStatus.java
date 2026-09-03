package com.arooraa.aura.discovery.domain;

/**
 * How far a project brief has got. The order matters: the handoff refuses anything that is not
 * {@link #SUMMARISED}, because a visitor cannot consent to sending us a summary they have not been
 * shown.
 */
public enum BriefStatus {

    /** Extracted from the conversation, but not yet put in front of the visitor. */
    DRAFT,

    /** The visitor has seen it. Only from here can consent mean anything. */
    SUMMARISED,

    /** Handed to the Start Project workflow. Terminal — a second attempt returns the same reference. */
    SUBMITTED
}
