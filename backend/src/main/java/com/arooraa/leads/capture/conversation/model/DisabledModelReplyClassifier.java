package com.arooraa.leads.capture.conversation.model;

import com.arooraa.leads.capture.conversation.QuestionStep;

import java.util.Optional;

/** The production-safe default: no model, the rules decide everything. */
public class DisabledModelReplyClassifier implements ModelReplyClassifier {

    @Override
    public Optional<ModelVerdict> classify(QuestionStep step, String customerText) {
        return Optional.empty();
    }

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public String describe() {
        return "disabled";
    }
}
