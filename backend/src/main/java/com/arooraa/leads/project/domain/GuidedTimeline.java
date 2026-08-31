package com.arooraa.leads.project.domain;

/**
 * Guided Start Project flow only (W3.2B) — mirrors frontend-v2 src/lib/start-project/types.ts
 * Timeline. Deliberately a separate type from {@link Timeline}: the value sets don't line up
 * (e.g. no "FLEXIBLE"/"WITHIN_1_MONTH" here), so reusing the legacy enum would either lose
 * information or force a speculative mapping.
 */
public enum GuidedTimeline {
    ASAP,
    WITHIN_1_TO_3_MONTHS,
    WITHIN_3_TO_6_MONTHS,
    SIX_MONTHS_PLUS,
    STILL_EXPLORING
}
