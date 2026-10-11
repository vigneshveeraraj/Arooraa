package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.conversation.domain.InterpretationSource;

/**
 * What one inbound message meant for the current question. {@code value} is set only for
 * {@link Intent#ANSWER}: one of {@link QuestionStep#allowedValues()}, or the cleaned text for a
 * free-text step. It is never shown back to the customer.
 */
public record Interpretation(Intent intent, String value, InterpretationSource source) {

    public enum Intent {
        ANSWER,
        PRICE_QUESTION,
        /** Asked for a person, or to stop the automated questions. */
        HUMAN,
        UNCLEAR
    }

    public static Interpretation answer(String value, InterpretationSource source) {
        return new Interpretation(Intent.ANSWER, value, source);
    }

    public static Interpretation of(Intent intent, InterpretationSource source) {
        return new Interpretation(intent, null, source);
    }

    public Interpretation withSource(InterpretationSource newSource) {
        return new Interpretation(intent, value, newSource);
    }
}
