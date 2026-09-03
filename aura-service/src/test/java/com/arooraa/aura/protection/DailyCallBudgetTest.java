package com.arooraa.aura.protection;

import com.arooraa.aura.protection.config.ProtectionProperties;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

/** The day's ceiling, and what happens on either side of it. */
class DailyCallBudgetTest {

    /** A clock a test can move, so these are about the boundary rather than about waiting. */
    private static final class MovableClock extends Clock {
        private Instant instant = Instant.parse("2026-09-03T10:00:00Z");

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return instant;
        }

        void advance(java.time.Duration by) {
            instant = instant.plus(by);
        }
    }

    private final MovableClock clock = new MovableClock();

    private DailyCallBudget budget(boolean enabled, int chatCallsPerDay) {
        ProtectionProperties properties = new ProtectionProperties(true, false, 100,
                null, null, null, null, null, null,
                new ProtectionProperties.Budget(enabled, chatCallsPerDay, 2, 2, 2));
        return new DailyCallBudget(properties, new SimpleMeterRegistry(), clock);
    }

    @Test
    void allowsCallsUpToTheCeilingAndRefusesTheNext() {
        DailyCallBudget budget = budget(true, 3);

        assertThat(budget.tryConsume(DailyCallBudget.Kind.CHAT)).isTrue();
        assertThat(budget.tryConsume(DailyCallBudget.Kind.CHAT)).isTrue();
        assertThat(budget.tryConsume(DailyCallBudget.Kind.CHAT)).isTrue();
        assertThat(budget.tryConsume(DailyCallBudget.Kind.CHAT)).isFalse();
    }

    @Test
    void doesNotKeepCountingPastTheCeiling() {
        // Otherwise "spent" climbs with every refused attempt and the number on a dashboard stops
        // being the number that was actually spent — which is the only number anybody wants.
        DailyCallBudget budget = budget(true, 2);
        for (int call = 0; call < 50; call++) budget.tryConsume(DailyCallBudget.Kind.CHAT);

        assertThat(budget.spent(DailyCallBudget.Kind.CHAT)).isEqualTo(2);
    }

    @Test
    void saysSoOncePerDayRatherThanOncePerRefusedCall() {
        // A ceiling reached at noon would otherwise log a warning for every request until midnight,
        // and a log that repeats itself thousands of times is one nobody reads on the day something
        // else goes wrong. Observed through the counter, which is where the volume belongs.
        SimpleMeterRegistry meters = new SimpleMeterRegistry();
        DailyCallBudget budget = new DailyCallBudget(
                new ProtectionProperties(true, false, 100, null, null, null, null, null, null,
                        new ProtectionProperties.Budget(true, 1, 2, 2, 2)),
                meters, clock);

        for (int call = 0; call < 10; call++) budget.tryConsume(DailyCallBudget.Kind.CHAT);

        assertThat(meters.counter("aura.protection.budget.refused", "kind", "CHAT").count())
                .isEqualTo(9);
    }

    @Test
    void keepsEachKindOnItsOwnCeiling() {
        // Speaking must not be able to spend the day's answering budget, and a visitor correcting
        // their brief repeatedly must not be able to stop everyone else asking questions.
        DailyCallBudget budget = budget(true, 1);
        budget.tryConsume(DailyCallBudget.Kind.CHAT);

        assertThat(budget.tryConsume(DailyCallBudget.Kind.SYNTHESIS)).isTrue();
        assertThat(budget.tryConsume(DailyCallBudget.Kind.EXTRACTION)).isTrue();
        assertThat(budget.tryConsume(DailyCallBudget.Kind.CHAT)).isFalse();
    }

    @Test
    void startsAgainOnTheNextDay() {
        DailyCallBudget budget = budget(true, 1);
        budget.tryConsume(DailyCallBudget.Kind.CHAT);
        assertThat(budget.tryConsume(DailyCallBudget.Kind.CHAT)).isFalse();

        clock.advance(java.time.Duration.ofDays(1));

        assertThat(budget.tryConsume(DailyCallBudget.Kind.CHAT)).isTrue();
        assertThat(budget.spent(DailyCallBudget.Kind.CHAT)).isEqualTo(1);
    }

    @Test
    void doesNotRollOverPartWayThroughADay() {
        DailyCallBudget budget = budget(true, 1);
        budget.tryConsume(DailyCallBudget.Kind.CHAT);

        clock.advance(java.time.Duration.ofHours(13));

        assertThat(budget.tryConsume(DailyCallBudget.Kind.CHAT)).isFalse();
    }

    @Test
    void countsTheDayInUtc() {
        // A boundary that follows the server's local zone is a boundary that moves when the server
        // does, and the ceilings would quietly change meaning without anybody editing them.
        assertThat(DailyCallBudget.zone()).isEqualTo(ZoneOffset.UTC);
        assertThat(budget(true, 1).day()).isEqualTo(java.time.LocalDate.of(2026, 9, 3));
    }

    @Test
    void allowsEverythingWhenSwitchedOff() {
        DailyCallBudget budget = budget(false, 1);

        for (int call = 0; call < 100; call++) {
            assertThat(budget.tryConsume(DailyCallBudget.Kind.CHAT)).isTrue();
        }
    }

    @Test
    void hasCeilingsEvenWhenNothingIsConfigured() {
        // The limit nobody sets is the limit that matters. A null here must not mean "unlimited".
        ProtectionProperties.Budget defaults = new ProtectionProperties.Budget(null, null, null, null, null);

        assertThat(defaults.enabled()).isTrue();
        assertThat(defaults.chatCallsPerDay()).isPositive();
        assertThat(defaults.transcriptionCallsPerDay()).isPositive();
        assertThat(defaults.synthesisCallsPerDay()).isPositive();
        assertThat(defaults.extractionCallsPerDay()).isPositive();
    }
}
