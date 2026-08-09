package com.arooraa.leads.project.service;

import com.arooraa.leads.project.web.dto.ProjectEnquiryResponse;

public sealed interface ProjectEnquirySubmitOutcome {

    ProjectEnquiryResponse body();

    record Created(ProjectEnquiryResponse body) implements ProjectEnquirySubmitOutcome {
    }

    record DuplicateDetected(ProjectEnquiryResponse body) implements ProjectEnquirySubmitOutcome {
    }
}
