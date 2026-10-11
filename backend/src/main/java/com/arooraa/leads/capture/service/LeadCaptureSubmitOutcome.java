package com.arooraa.leads.capture.service;

import com.arooraa.leads.capture.web.dto.LeadCaptureResponse;

public sealed interface LeadCaptureSubmitOutcome {

    LeadCaptureResponse body();

    record Created(LeadCaptureResponse body) implements LeadCaptureSubmitOutcome {
    }

    record DuplicateDetected(LeadCaptureResponse body) implements LeadCaptureSubmitOutcome {
    }
}
