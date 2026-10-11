package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.conversation.Interpretation.Intent;
import com.arooraa.leads.capture.conversation.domain.InterpretationSource;
import com.arooraa.leads.capture.conversation.model.ModelReplyClassifier;
import com.arooraa.leads.capture.conversation.model.ModelReplyClassifier.ModelVerdict;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReplyInterpreterTest {

    private ModelReplyClassifier model;
    private ReplyInterpreter interpreter;

    @BeforeEach
    void setUp() {
        model = mock(ModelReplyClassifier.class);
        when(model.isEnabled()).thenReturn(true);
        interpreter = new ReplyInterpreter(new RuleBasedReplyInterpreter(), model);
    }

    @Test
    void theModelIsNotAskedWhenTheRulesAreSure() {
        Interpretation reading = interpreter.interpret(QuestionStep.CALL_TIME, "evening");

        assertEquals("EVENING", reading.value());
        assertEquals(InterpretationSource.RULES, reading.source());
        verify(model, never()).classify(any(), any());
    }

    @Test
    void theModelPlacesAReplyTheRulesCouldNot() {
        when(model.classify(QuestionStep.CALL_TIME, "saapattuku apram"))
                .thenReturn(Optional.of(new ModelVerdict("ANSWER", "AFTERNOON")));

        Interpretation reading = interpreter.interpret(QuestionStep.CALL_TIME, "saapattuku apram");

        assertEquals(Intent.ANSWER, reading.intent());
        assertEquals("AFTERNOON", reading.value());
        assertEquals(InterpretationSource.MODEL, reading.source());
    }

    @Test
    void aFailedModelFallsBackToTheRules() {
        when(model.classify(any(), any())).thenReturn(Optional.empty());

        Interpretation reading = interpreter.interpret(QuestionStep.CALL_TIME, "saapattuku apram");

        assertEquals(Intent.UNCLEAR, reading.intent());
        assertEquals(InterpretationSource.FALLBACK, reading.source());
    }

    @Test
    void aDisabledModelIsNeverCalled() {
        when(model.isEnabled()).thenReturn(false);

        Interpretation reading = interpreter.interpret(QuestionStep.CALL_TIME, "saapattuku apram");

        assertEquals(Intent.UNCLEAR, reading.intent());
        assertEquals(InterpretationSource.RULES, reading.source());
        verify(model, never()).classify(any(), any());
    }

    @Test
    void forFreeTextTheStoredAnswerIsAlwaysTheCustomersOwnWords() {
        // A business answer with a "?" is double-checked; the model agrees it's an answer.
        when(model.classify(QuestionStep.BUSINESS_TYPE, "bakery?")).thenReturn(Optional.of(new ModelVerdict("ANSWER", null)));

        Interpretation reading = interpreter.interpret(QuestionStep.BUSINESS_TYPE, "bakery?");

        assertEquals(Intent.ANSWER, reading.intent());
        assertEquals("bakery?", reading.value());
        assertEquals(InterpretationSource.MODEL, reading.source());
    }

    @Test
    void forFreeTextTheModelCanSpotAQuestionTheRulesMissed() {
        when(model.classify(QuestionStep.BUSINESS_TYPE, "website ku enna aagum?"))
                .thenReturn(Optional.of(new ModelVerdict("PRICE_QUESTION", null)));

        Interpretation reading = interpreter.interpret(QuestionStep.BUSINESS_TYPE, "website ku enna aagum?");

        assertEquals(Intent.PRICE_QUESTION, reading.intent());
        assertEquals(null, reading.value());
    }
}
