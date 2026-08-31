package com.arooraa.leads.careers.service;

import com.arooraa.leads.careers.web.dto.JobApplicationResponse;

public sealed interface JobApplicationSubmitOutcome {

    JobApplicationResponse body();

    record Created(JobApplicationResponse body) implements JobApplicationSubmitOutcome {
    }

    record DuplicateDetected(JobApplicationResponse body) implements JobApplicationSubmitOutcome {
    }
}
