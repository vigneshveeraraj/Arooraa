package com.arooraa.aura.conversation.language;

import com.arooraa.aura.conversation.domain.Language;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The visitor's language decides Aura's, with no dropdown anywhere. */
class LanguageDetectorTest {

    private final LanguageDetector detector = new LanguageDetector();

    @ParameterizedTest
    @ValueSource(strings = {
            "What is AROORAA?",
            "Can MESA help restaurants?",
            "I have a product idea. Can you help?",
            "Hi Aura"})
    void plainEnglishIsEnglish(String message) {
        assertEquals(Language.ENGLISH, detector.detect(message), message);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "AROORAA enna company?",
            "MESA restaurant-ku enna help pannum?",
            "Enaku oru software idea iruku.",
            "Existing application-a modernize panna help pannuveengala?",
            "Restaurant billing and kitchen problem solve panna mudiyuma?"})
    void romanizedTamilIsTanglish(String message) {
        assertEquals(Language.TANGLISH, detector.detect(message), message);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "AROORAA என்ன மாதிரி company?",
            "எனக்கு ஒரு AI product develop பண்ணணும்.",
            "Existing software-ஐ modernize பண்ண முடியுமா?"})
    void tamilScriptIsTamil(String message) {
        assertEquals(Language.TAMIL, detector.detect(message), message);
    }

    @Test
    void mixedScriptStaysTamilRatherThanBeingTreatedAsAnEdgeCase() {
        // Tamil speakers routinely write English technical words in Latin script mid-sentence.
        // The reply should still be Tamil.
        assertEquals(Language.TAMIL, detector.detect("MESA restaurantக்கு எப்படி help பண்ணும்?"));
    }

    @Test
    void anEmptyMessageFallsBackToEnglishRatherThanFailing() {
        assertEquals(Language.ENGLISH, detector.detect(""));
        assertEquals(Language.ENGLISH, detector.detect(null));
    }
}
