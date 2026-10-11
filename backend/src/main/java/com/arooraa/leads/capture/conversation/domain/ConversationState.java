package com.arooraa.leads.capture.conversation.domain;

/** Where a scripted conversation is. COMPLETED and HANDED_OFF are where the script stops asking. */
public enum ConversationState {
    AWAITING_LANGUAGE,
    AWAITING_REQUIREMENT,
    AWAITING_BUSINESS_TYPE,
    AWAITING_CALL_TIME,
    COMPLETED,
    /** A person owns the chat now; the script sends nothing more. */
    HANDED_OFF
}
