package com.arooraa.aura.conversation.language;

import com.arooraa.aura.conversation.domain.ConversationTone;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Tone only steers delivery, so the tests that matter most are the ones about humour: getting
 * "cheerful" slightly wrong is harmless, being flippant at a frustrated or serious visitor is not.
 */
class ToneDetectorTest {

    private final ToneDetector detector = new ToneDetector();

    @Test
    void frustrationIsDetectedAndSuppressesHumour() {
        ConversationTone tone = detector.detect("I'm frustrated with my current software.");

        assertEquals(ConversationTone.FRUSTRATED, tone);
        assertTrue(tone.suppressesHumour());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "We had a security breach last week.",
            "This is urgent — our system is down.",
            "We're in a legal dispute with a vendor."})
    void seriousSituationsSuppressHumour(String message) {
        ConversationTone tone = detector.detect(message);

        assertEquals(ConversationTone.SERIOUS, tone, message);
        assertTrue(tone.suppressesHumour(), message);
    }

    @Test
    void casualGreetingsReadAsCasualAndAllowHumour() {
        ConversationTone tone = detector.detect("Hey bro");

        assertEquals(ConversationTone.CASUAL, tone);
        assertFalse(tone.suppressesHumour());
    }

    @Test
    void enthusiasmIsDetected() {
        assertEquals(ConversationTone.EXCITED, detector.detect("I have a crazy idea I want to tell you about"));
    }

    @Test
    void gratitudeReadsAsHappy() {
        assertEquals(ConversationTone.HAPPY, detector.detect("Thanks, that was really helpful"));
    }

    @Test
    void anEmojiAloneIsEnoughToReadAsHappy() {
        assertEquals(ConversationTone.HAPPY, detector.detect("Sounds like a plan 😄"));
    }

    @Test
    void technicalVocabularyReadsAsTechnical() {
        assertEquals(ConversationTone.TECHNICAL, detector.detect("How would you handle caching and API latency?"));
    }

    @Test
    void aPlainQuestionReadsAsCurious() {
        assertEquals(ConversationTone.CURIOUS, detector.detect("Which industries do you usually work with?"));
    }

    @Test
    void statementsWithNoSignalStayNeutral() {
        ConversationTone tone = detector.detect("We have offices in three cities.");

        assertEquals(ConversationTone.NEUTRAL, tone);
        assertFalse(tone.suppressesHumour());
    }
}
