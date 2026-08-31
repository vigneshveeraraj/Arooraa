package com.arooraa.leads.project.domain;

/**
 * Guided Start Project flow only (W3.2B) — mirrors frontend-v2 src/lib/start-project/types.ts
 * BudgetRange. Deliberately a separate type from {@link BudgetRange}: the bands don't line up
 * with the legacy enum's INR bands, so reusing it would force a speculative mapping.
 */
public enum GuidedBudgetRange {
    STILL_DEFINING,
    UNDER_5L,
    FROM_5L_TO_15L,
    FROM_15L_TO_50L,
    ABOVE_50L,
    PREFER_TO_DISCUSS,
    NOT_SURE_YET
}
