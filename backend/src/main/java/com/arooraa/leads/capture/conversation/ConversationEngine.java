package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.conversation.domain.ConversationState;
import com.arooraa.leads.capture.conversation.domain.InterpretationSource;
import com.arooraa.leads.capture.domain.LeadLanguage;
import com.arooraa.leads.capture.domain.LeadRequirement;
import com.arooraa.leads.capture.domain.PreferredCallTime;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * The lead-qualification script as a state machine (frontend-v2/docs/lead-capture.md): language
 * first, then requirement (only if the lead doesn't have one), business type, a call time, close.
 * One question per message. No persistence and no I/O beyond the interpreter, so every path is
 * unit-testable.
 *
 * Off-script turns: a price question gets the fixed pricing answer and the same question again;
 * asking for a person (or "stop") hands the chat to the team; a reply that still can't be
 * understood after one retry also hands off, rather than looping. Once handed off the script
 * stays silent — a person owns the chat.
 */
@Component
public class ConversationEngine {

    static final int MAX_UNCLEAR_REPLIES = 2;

    private final ReplyInterpreter interpreter;
    private final RuleBasedReplyInterpreter rules;

    public ConversationEngine(ReplyInterpreter interpreter, RuleBasedReplyInterpreter rules) {
        this.interpreter = interpreter;
        this.rules = rules;
    }

    /** The current conversation, as far as the script needs to know it. */
    public record Snapshot(ConversationState state, LeadLanguage language, LeadLanguage sourceLocale,
                           boolean leadHasRequirement, int unclearCount) {
    }

    /** What the lead learned this turn; null fields mean "unchanged". */
    public record LeadUpdates(LeadLanguage language, LeadRequirement requirement, String businessType,
                              PreferredCallTime callTime, boolean handoffRequested) {
        static final LeadUpdates NONE = new LeadUpdates(null, null, null, null, false);
    }

    public record Turn(ConversationState state, LeadLanguage language, int unclearCount, LeadUpdates updates,
                       List<String> replies, InterpretationSource interpretedBy) {
    }

    /** The first message of a conversation, whatever it says: ask for the language. */
    public Turn start(LeadLanguage sourceLocale) {
        return new Turn(ConversationState.AWAITING_LANGUAGE, null, 0, LeadUpdates.NONE,
                List.of(ConversationScript.welcome(sourceLocale)), null);
    }

    public Turn handle(Snapshot s, String text) {
        return switch (s.state()) {
            case HANDED_OFF -> new Turn(s.state(), s.language(), s.unclearCount(), LeadUpdates.NONE, List.of(), null);
            case COMPLETED -> afterCompletion(s, text);
            case AWAITING_LANGUAGE -> ask(s, QuestionStep.LANGUAGE, text);
            case AWAITING_REQUIREMENT -> ask(s, QuestionStep.REQUIREMENT, text);
            case AWAITING_BUSINESS_TYPE -> ask(s, QuestionStep.BUSINESS_TYPE, text);
            case AWAITING_CALL_TIME -> ask(s, QuestionStep.CALL_TIME, text);
        };
    }

    private Turn afterCompletion(Snapshot s, String text) {
        if (rules.isPriceQuestion(text)) {
            return new Turn(s.state(), s.language(), 0, LeadUpdates.NONE,
                    List.of(ConversationScript.priceAnswer(null, s.language(), s.sourceLocale())), InterpretationSource.RULES);
        }
        return handOff(s, InterpretationSource.RULES);
    }

    private Turn ask(Snapshot s, QuestionStep step, String text) {
        Interpretation reading = interpreter.interpret(step, text);
        return switch (reading.intent()) {
            case HUMAN -> handOff(s, reading.source());
            case PRICE_QUESTION -> new Turn(s.state(), s.language(), s.unclearCount(), LeadUpdates.NONE,
                    List.of(ConversationScript.priceAnswer(step, s.language(), s.sourceLocale())), reading.source());
            case UNCLEAR -> {
                int unclear = s.unclearCount() + 1;
                if (unclear >= MAX_UNCLEAR_REPLIES) {
                    yield handOff(s, reading.source());
                }
                LeadLanguage shown = s.language() != null ? s.language() : s.sourceLocale();
                yield new Turn(s.state(), s.language(), unclear, LeadUpdates.NONE,
                        List.of(ConversationScript.retry(step, shown)), reading.source());
            }
            case ANSWER -> answered(s, step, reading);
        };
    }

    private Turn answered(Snapshot s, QuestionStep step, Interpretation reading) {
        String value = reading.value();
        return switch (step) {
            case LANGUAGE -> {
                LeadLanguage language = LeadLanguage.valueOf(value);
                QuestionStep next = s.leadHasRequirement() ? QuestionStep.BUSINESS_TYPE : QuestionStep.REQUIREMENT;
                yield next(next, language, new LeadUpdates(language, null, null, null, false), reading);
            }
            case REQUIREMENT -> next(QuestionStep.BUSINESS_TYPE, s.language(),
                    new LeadUpdates(null, LeadRequirement.valueOf(value), null, null, false), reading);
            case BUSINESS_TYPE -> next(QuestionStep.CALL_TIME, s.language(),
                    new LeadUpdates(null, null, value, null, false), reading);
            case CALL_TIME -> new Turn(ConversationState.COMPLETED, s.language(), 0,
                    new LeadUpdates(null, null, null, PreferredCallTime.valueOf(value), false),
                    List.of(ConversationScript.close(s.language())), reading.source());
        };
    }

    private static Turn next(QuestionStep step, LeadLanguage language, LeadUpdates updates, Interpretation reading) {
        return new Turn(stateFor(step), language, 0, updates, List.of(ConversationScript.question(step, language)),
                reading.source());
    }

    private static Turn handOff(Snapshot s, InterpretationSource source) {
        return new Turn(ConversationState.HANDED_OFF, s.language(), 0, new LeadUpdates(null, null, null, null, true),
                List.of(ConversationScript.handoff(s.language(), s.sourceLocale())), source);
    }

    private static ConversationState stateFor(QuestionStep step) {
        return switch (step) {
            case LANGUAGE -> ConversationState.AWAITING_LANGUAGE;
            case REQUIREMENT -> ConversationState.AWAITING_REQUIREMENT;
            case BUSINESS_TYPE -> ConversationState.AWAITING_BUSINESS_TYPE;
            case CALL_TIME -> ConversationState.AWAITING_CALL_TIME;
        };
    }
}
