package com.arooraa.aura.voice;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The one rule this class exists to keep: what is heard can only ever be what was displayed, minus
 * markup and possibly minus its tail. Never a rephrasing, never an addition.
 */
class SpeechTextPreparerTest {

    private final SpeechTextPreparer preparer = new SpeechTextPreparer();

    @Test
    void leavesAPlainAnswerExactlyAsItIs() {
        String answer = "MESA is AROORAA's connected restaurant technology ecosystem.";
        assertThat(preparer.prepare(answer, 700)).isEqualTo(answer);
    }

    @Test
    void doesNotReadEmphasisMarkersAloud() {
        assertThat(preparer.prepare("MESA is **connected** and *real-time*.", 700))
                .isEqualTo("MESA is connected and real-time.");
    }

    @Test
    void doesNotReadBackticksAloud() {
        assertThat(preparer.prepare("The mode is `GROUNDED_QA` here.", 700))
                .isEqualTo("The mode is GROUNDED_QA here.");
    }

    @Test
    void turnsBulletsIntoPausesRatherThanWords() {
        String spoken = preparer.prepare("It covers:\n- dine-in\n- ordering\n- kitchen", 700);
        assertThat(spoken).isEqualTo("It covers:, dine-in, ordering, kitchen");
        // The hyphen inside "dine-in" is a word, not a marker — what must not survive is a bullet
        // at the start of an item, which is the thing a synthesizer would read as a character.
        assertThat(spoken).doesNotContain(", - ").doesNotContain("* ").doesNotContain("• ");
    }

    @Test
    void joinsParagraphsIntoContinuousSpeech() {
        assertThat(preparer.prepare("First thought.\n\nSecond thought.", 700))
                .isEqualTo("First thought. Second thought.");
    }

    @Test
    void keepsTamilScriptIntact() {
        String tamil = "MESA என்பது ஒரு உணவக தொழில்நுட்ப அமைப்பு.";
        assertThat(preparer.prepare(tamil, 700)).isEqualTo(tamil);
    }

    @Test
    void keepsTanglishExactlyAsWritten() {
        String tanglish = "MESA unga restaurant-ku full-a connect pannum.";
        assertThat(preparer.prepare(tanglish, 700)).isEqualTo(tanglish);
    }

    @Test
    void clampsALongAnswerAtASentenceBoundaryRatherThanMidWord() {
        String answer = "One sentence here. Two sentences here. Three sentences here. "
                + "And a fourth that runs past the limit entirely.";
        String spoken = preparer.prepare(answer, 60);

        // 60 characters lands exactly on the third full stop, so three sentences are spoken and
        // the fourth — the one that would have been cut mid-clause — is left on screen only.
        assertThat(spoken).isEqualTo("One sentence here. Two sentences here. Three sentences here.");
        assertThat(answer).startsWith(spoken);
    }

    @Test
    void whatIsSpokenIsAlwaysAPrefixOfWhatIsDisplayed() {
        // The property that makes this class safe to put between an answer and a speaker: no
        // clamp, however aggressive, can produce a word the visitor is not also reading.
        String answer = "MESA brings dine-in, ordering, kitchen and staff operations into one "
                + "real-time system across every restaurant format AROORAA supports.";
        for (int limit = 20; limit <= 160; limit += 7) {
            assertThat(answer).startsWith(preparer.prepare(answer, limit));
        }
    }

    @Test
    void fallsBackToAWordBoundaryWhenNoSentenceEndsInRange() {
        String answer = "A single very long clause that simply keeps going without any full stop at all";
        String spoken = preparer.prepare(answer, 40);

        assertThat(spoken).doesNotEndWith(" ");
        assertThat(answer).startsWith(spoken);
        assertThat(answer.charAt(spoken.length())).isEqualTo(' ');
    }

    @Test
    void treatsAZeroOrNegativeLimitAsNoLimit() {
        String answer = "Nothing here should be cut.";
        assertThat(preparer.prepare(answer, 0)).isEqualTo(answer);
        assertThat(preparer.prepare(answer, -1)).isEqualTo(answer);
    }

    @Test
    void returnsNothingForNothing() {
        assertThat(preparer.prepare(null, 700)).isEmpty();
        assertThat(preparer.prepare("   ", 700)).isEmpty();
    }
}
