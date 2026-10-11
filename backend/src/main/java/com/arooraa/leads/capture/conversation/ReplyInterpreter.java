package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.conversation.Interpretation.Intent;
import com.arooraa.leads.capture.conversation.domain.InterpretationSource;
import com.arooraa.leads.capture.conversation.model.ModelReplyClassifier;
import com.arooraa.leads.capture.conversation.model.ModelReplyClassifier.ModelVerdict;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Rules first, model second. The model is asked only when the rules can't place a reply (or a
 * free-text business answer looks like it might be a question), and its verdict is used only if
 * it lands inside the step's closed set — otherwise the rules' answer stands, marked FALLBACK.
 */
@Component
public class ReplyInterpreter {

    private final RuleBasedReplyInterpreter rules;
    private final ModelReplyClassifier model;

    public ReplyInterpreter(RuleBasedReplyInterpreter rules, ModelReplyClassifier model) {
        this.rules = rules;
        this.model = model;
    }

    public Interpretation interpret(QuestionStep step, String text) {
        Interpretation byRules = rules.interpret(step, text);
        boolean possibleQuestion = step.isFreeText() && byRules.intent() == Intent.ANSWER && text.contains("?");
        if ((byRules.intent() != Intent.UNCLEAR && !possibleQuestion) || !model.isEnabled()) {
            return byRules;
        }

        Optional<ModelVerdict> verdict = model.classify(step, text);
        if (verdict.isEmpty()) {
            return byRules.withSource(InterpretationSource.FALLBACK);
        }
        Intent intent = Intent.valueOf(verdict.get().intent());
        boolean redirects = intent == Intent.PRICE_QUESTION || intent == Intent.HUMAN;
        if (step.isFreeText()) {
            // The model may only spot a price question or a request for a person here; the
            // stored answer is always the customer's own words, never model output.
            return redirects ? Interpretation.of(intent, InterpretationSource.MODEL)
                    : byRules.withSource(InterpretationSource.MODEL);
        }
        return intent == Intent.ANSWER
                ? Interpretation.answer(verdict.get().value(), InterpretationSource.MODEL)
                : Interpretation.of(intent, InterpretationSource.MODEL);
    }
}
