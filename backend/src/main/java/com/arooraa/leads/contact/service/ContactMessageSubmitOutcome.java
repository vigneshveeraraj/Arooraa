package com.arooraa.leads.contact.service;

import com.arooraa.leads.contact.web.dto.ContactMessageResponse;

public sealed interface ContactMessageSubmitOutcome {

    ContactMessageResponse body();

    record Created(ContactMessageResponse body) implements ContactMessageSubmitOutcome {
    }

    record DuplicateDetected(ContactMessageResponse body) implements ContactMessageSubmitOutcome {
    }
}
