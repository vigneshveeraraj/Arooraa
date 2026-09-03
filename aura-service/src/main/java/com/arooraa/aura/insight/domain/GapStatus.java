package com.arooraa.aura.insight.domain;

/**
 * What has been done about a gap. It starts OPEN and only a person moves it — there is no path
 * from this table into ingestion, so nothing here can become knowledge without somebody deciding
 * that it should.
 */
public enum GapStatus {

    OPEN,
    /** Somebody has picked it up. */
    IN_REVIEW,
    /** Answered — {@code resolutionReference} says where. */
    RESOLVED,
    /** Deliberately not answering this one. */
    DISMISSED
}
