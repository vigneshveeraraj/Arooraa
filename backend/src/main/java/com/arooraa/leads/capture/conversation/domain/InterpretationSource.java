package com.arooraa.leads.capture.conversation.domain;

/** How an inbound message was understood — recorded per message so model usefulness can be measured. */
public enum InterpretationSource {
    /** The deterministic rules matched. */
    RULES,
    /** The rules were unsure and the local model's validated classification was used. */
    MODEL,
    /** The model was consulted but failed, timed out or answered outside the allowed values. */
    FALLBACK
}
