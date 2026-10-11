package com.arooraa.leads.capture.domain;

public enum ConsentSource {
    /** The visitor ticked the consent checkbox; consent_text holds the exact sentence shown. */
    WEB_FORM,
    /** The customer started the conversation themselves. */
    CUSTOMER_INITIATED_CHAT
}
