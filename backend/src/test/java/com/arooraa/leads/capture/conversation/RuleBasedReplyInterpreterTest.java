package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.conversation.Interpretation.Intent;
import com.arooraa.leads.capture.conversation.domain.InterpretationSource;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class RuleBasedReplyInterpreterTest {

    private final RuleBasedReplyInterpreter rules = new RuleBasedReplyInterpreter();

    private void assertAnswer(QuestionStep step, String text, String expected) {
        Interpretation reading = rules.interpret(step, text);
        assertEquals(Intent.ANSWER, reading.intent(), () -> "for: " + text);
        assertEquals(expected, reading.value(), () -> "for: " + text);
        assertEquals(InterpretationSource.RULES, reading.source());
    }

    private void assertIntent(QuestionStep step, String text, Intent expected) {
        Interpretation reading = rules.interpret(step, text);
        assertEquals(expected, reading.intent(), () -> "for: " + text);
        if (expected != Intent.ANSWER) {
            assertNull(reading.value());
        }
    }

    @ParameterizedTest
    @CsvSource({
            "1, EN", "2, TA", "two, TA", "English please, EN", "Tamil, TA", "thamizh la pesalam, TA",
            "தமிழ், TA", "ஆங்கிலம், EN",
            // Writing in Tamil script answers "which language?" by itself.
            "வணக்கம், TA"})
    void languageInEnglishTamilAndTanglish(String text, String expected) {
        assertAnswer(QuestionStep.LANGUAGE, text, expected);
    }

    @ParameterizedTest
    @ValueSource(strings = {"hello", "3", "english or tamil", ""})
    void languageIsUnclearWhenNoSingleLanguageIsChosen(String text) {
        assertIntent(QuestionStep.LANGUAGE, text, Intent.UNCLEAR);
    }

    @ParameterizedTest
    @CsvSource({
            "1, WEBSITE", "3., AI_AUTOMATION", "6, NOT_SURE",
            "I need a website, WEBSITE",
            "enakku website venum, WEBSITE",
            "help with replying to whatsapp enquiries, CUSTOMER_ENQUIRIES",
            "billing software, BUSINESS_APPLICATION",
            "more customers venum, MARKETING_LEADS",
            "theriyala, NOT_SURE",
            "தெரியவில்லை, NOT_SURE"})
    void requirementByNumberOrWords(String text, String expected) {
        assertAnswer(QuestionStep.REQUIREMENT, text, expected);
    }

    @ParameterizedTest
    @ValueSource(strings = {"7", "website and seo", "hello"})
    void requirementIsUnclearWhenNothingOrMoreThanOneThingMatches(String text) {
        assertIntent(QuestionStep.REQUIREMENT, text, Intent.UNCLEAR);
    }

    @Test
    void businessTypeKeepsTheCustomersOwnWords() {
        assertAnswer(QuestionStep.BUSINESS_TYPE, "  Textile   shop in Erode ", "Textile shop in Erode");
        assertAnswer(QuestionStep.BUSINESS_TYPE, "bus stop tea shop", "bus stop tea shop");
        // "coffee" contains "fee" but is not a price question.
        assertAnswer(QuestionStep.BUSINESS_TYPE, "coffee shop", "coffee shop");
    }

    @Test
    void businessTypeIsCappedAtTheColumnSize() {
        String answer = rules.interpret(QuestionStep.BUSINESS_TYPE, "bakery ".repeat(40)).value();
        assertEquals(150, answer.length());
    }

    @ParameterizedTest
    @ValueSource(strings = {"ok", "Hi!", "12345", "சரி", "?"})
    void businessTypeRejectsNonAnswers(String text) {
        assertIntent(QuestionStep.BUSINESS_TYPE, text, Intent.UNCLEAR);
    }

    @ParameterizedTest
    @CsvSource({
            "morning, MORNING", "kaalaila call pannunga, MORNING", "காலை, MORNING", "10 am, MORNING",
            "after lunch, AFTERNOON", "3 pm, AFTERNOON", "மதியம், AFTERNOON",
            "evening, EVENING", "7pm, EVENING", "maalai, EVENING", "மாலை, EVENING"})
    void callTimeInWordsAndClockTimes(String text, String expected) {
        assertAnswer(QuestionStep.CALL_TIME, text, expected);
    }

    @ParameterizedTest
    @ValueSource(strings = {"morning or evening", "anytime", "எப்போ வேணாலும்"})
    void callTimeIsUnclearWhenAmbiguous(String text) {
        assertIntent(QuestionStep.CALL_TIME, text, Intent.UNCLEAR);
    }

    @ParameterizedTest
    @ValueSource(strings = {"how much does a website cost?", "price?", "evlo aagum", "website rate enna",
            "விலை என்ன?", "எவ்வளவு ஆகும்", "Rs 5000 ok va"})
    void priceQuestionsAreRecognisedAtEveryStep(String text) {
        for (QuestionStep step : QuestionStep.values()) {
            assertIntent(step, text, Intent.PRICE_QUESTION);
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"talk to a person", "I want a human", "STOP", "stop.", "aal venum", "யாராவது பேசுங்க"})
    void askingForAPersonOrToStopHandsOff(String text) {
        for (QuestionStep step : QuestionStep.values()) {
            assertIntent(step, text, Intent.HUMAN);
        }
    }
}
