package com.arooraa.leads.contact.domain;

/**
 * Deliberately never includes a "start a project" value (W3.4 §3) — that intent is routed
 * entirely to /start-project's own flow, never modeled or persisted here.
 */
public enum ContactReason {
    GENERAL,
    PARTNERSHIP,
    PRODUCT_QUESTION,
    BUSINESS_ENQUIRY,
    MEDIA,
    CAREERS,
    OTHER
}
