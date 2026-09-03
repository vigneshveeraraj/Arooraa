package com.arooraa.aura.discovery;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The one way a value can be perfectly grounded and still be the opposite of true.
 *
 * <p>Half of these tests are about what this must <em>not</em> reject. A guard that reads any
 * nearby "not" as a veto would quietly delete real requirements, and a brief that is missing what
 * somebody asked for is worse than no brief at all — they would have to say it twice and watch it
 * disappear twice.
 */
class NegationScopeTest {

    @Test
    void rejectsSomethingTheVisitorExplicitlyRuledOut() {
        // Every word of "mobile app" is in this sentence, so coverage alone is delighted with it.
        assertThat(NegationScope.rejects("mobile app", "We do not need a mobile app.")).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "We don't need a mobile app.",
            "We don’t need a mobile app.",
            "We will never need a mobile app.",
            "There is no mobile app in this.",
            "We can do it without a mobile app.",
            "Please avoid a mobile app.",
            "We cannot use a mobile app.",
            "We want a web app rather than a mobile app.",
            "A web portal instead of a mobile app.",
    })
    void readsTheWaysPeopleActuallyWriteIt(String said) {
        assertThat(NegationScope.rejects("mobile app", said)).isTrue();
    }

    @Test
    void keepsSomethingTheVisitorAskedForInThePlainestPossibleWay() {
        assertThat(NegationScope.rejects("mobile app", "We need a mobile app for parents.")).isFalse();
    }

    @Test
    void doesNotLetANegationReachPastTheClauseItBelongsTo() {
        // The false positive that matters most, because it is how people write. The negation is
        // about the website; the mobile app is the thing they are asking for.
        assertThat(NegationScope.rejects("mobile app",
                "We don't have a website yet, so we need a mobile app.")).isFalse();
    }

    @Test
    void doesNotLetANegationInOneSentenceRuleOutTheNext() {
        assertThat(NegationScope.rejects("mobile app",
                "We do not have any developers. We need a mobile app built.")).isFalse();
    }

    @Test
    void keepsSomethingRuledOutOnceAndAskedForElsewhere() {
        // Asked for plainly at least once settles it, whatever else was said. A person who changed
        // their mind gets what they last asked for, and the brief they are shown lets them see it.
        assertThat(NegationScope.rejects("mobile app",
                "At first we did not want a mobile app. Now we do want a mobile app.")).isFalse();
    }

    @Test
    void keepsWhatComesBeforeTheNegationInTheSameBreath() {
        String said = "We want a web app rather than a mobile app.";

        assertThat(NegationScope.rejects("web app", said)).isFalse();
        assertThat(NegationScope.rejects("mobile app", said)).isTrue();
    }

    @Test
    void saysNothingAboutAValueNoSingleClauseAccountsFor() {
        // Its words are spread across the transcript, so there is no sentence to read a negation
        // from. Coverage has already accepted it and this has nothing to add.
        assertThat(NegationScope.rejects("mobile app for parents",
                "We are not sure about much. Parents are the users. An app of some kind.")).isFalse();
    }

    @Test
    void saysNothingAboutAValueTheVisitorNeverMentioned() {
        // Not this guard's job — an ungrounded value never reaches it, because coverage drops it.
        assertThat(NegationScope.rejects("PowerSchool integration", "We do not need a mobile app.")).isFalse();
    }

    @Test
    void toleratesNothingToJudge() {
        assertThat(NegationScope.rejects(null, "We do not need a mobile app.")).isFalse();
        assertThat(NegationScope.rejects("  ", "We do not need a mobile app.")).isFalse();
        assertThat(NegationScope.rejects("mobile app", null)).isFalse();
        assertThat(NegationScope.rejects("mobile app", "")).isFalse();
    }
}
