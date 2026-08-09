package com.arooraa.leads.project.domain;

/**
 * Business-friendly budget bands for the Indian market. Java identifiers cannot start
 * with a digit, so ranges are spelled "FROM_x_TO_y" rather than "xK_TO_yL"; the frontend
 * owns the exact display label, this enum is only a stable wire value.
 */
public enum BudgetRange {
    UNDER_50K,
    FROM_50K_TO_2L,
    FROM_2L_TO_5L,
    FROM_5L_TO_10L,
    ABOVE_10L,
    NEED_GUIDANCE
}
