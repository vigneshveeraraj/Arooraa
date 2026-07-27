package com.arooraa.leads.service;

import com.arooraa.leads.web.dto.DemoRequestResponse;

public sealed interface SubmitOutcome {

    DemoRequestResponse body();

    record Created(DemoRequestResponse body) implements SubmitOutcome {
    }

    record DuplicateDetected(DemoRequestResponse body) implements SubmitOutcome {
    }
}
