package com.arooraa.leads.capture.conversation.model;

import com.arooraa.leads.capture.conversation.QuestionStep;

import java.util.Optional;

/**
 * An optional language model that classifies a reply the deterministic rules couldn't place.
 * It only ever chooses from a closed set (an intent, and for an answer one of the step's
 * allowed values); it never writes text a customer sees.
 *
 * Implementations must never throw and must bound their own latency: on any failure, timeout or
 * out-of-range answer they return {@link Optional#empty()} and the caller falls back to the rules.
 */
public interface ModelReplyClassifier {

    Optional<ModelVerdict> classify(QuestionStep step, String customerText);

    boolean isEnabled();

    /** For logs and diagnostics, e.g. "ollama:qwen3-vl:4b-instruct". Never contains secrets. */
    String describe();

    /** {@code value} is null unless {@code intent} is ANSWER. */
    record ModelVerdict(String intent, String value) {
    }
}
