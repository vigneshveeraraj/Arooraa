package com.arooraa.leads.capture.domain;

public enum LeadSource {
    /** The consultation form on the website. */
    WEBSITE,
    /** The customer messaged AROORAA's WhatsApp number without a matching saved lead. */
    WHATSAPP,
    /** The loopback-only local conversation simulator — never enabled in production. */
    SIMULATOR
}
