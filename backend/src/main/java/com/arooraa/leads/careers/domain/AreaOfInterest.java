package com.arooraa.leads.careers.domain;

/**
 * Structured areas of interest (W3.3B §11) — mirrors frontend-v2's
 * {@code lib/careers/alerts-types.ts} value set exactly, so the wire values a talent-community
 * submission sends need no translation layer. Stored as a real value per row (talent_subscription_areas),
 * never collapsed into a single free-text display-label column.
 */
public enum AreaOfInterest {
    AI_DATA,
    BACKEND_FULL_STACK,
    FRONTEND,
    PRODUCT_DESIGN,
    SALES,
    MARKETING_GROWTH,
    ANY
}
