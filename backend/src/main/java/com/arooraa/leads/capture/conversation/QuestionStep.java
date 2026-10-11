package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.domain.LeadRequirement;
import com.arooraa.leads.capture.domain.PreferredCallTime;

import java.util.Arrays;
import java.util.List;

/** The question currently waiting for an answer, and the only values an answer to it may take. */
public enum QuestionStep {
    LANGUAGE(List.of("EN", "TA")),
    REQUIREMENT(Arrays.stream(LeadRequirement.values()).map(Enum::name).toList()),
    /** Free text — any short description of the business is an answer. */
    BUSINESS_TYPE(List.of()),
    CALL_TIME(Arrays.stream(PreferredCallTime.values()).map(Enum::name).toList());

    private final List<String> allowedValues;

    QuestionStep(List<String> allowedValues) {
        this.allowedValues = allowedValues;
    }

    public List<String> allowedValues() {
        return allowedValues;
    }

    public boolean isFreeText() {
        return allowedValues.isEmpty();
    }
}
