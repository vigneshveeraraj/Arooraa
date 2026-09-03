package com.arooraa.aura.protection;

import com.arooraa.aura.protection.config.ProtectionProperties;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;

/**
 * A budget for tests that are not about the budget.
 *
 * <p>Switched off rather than set very high, so a test can never fail because it happened to be
 * the two-thousand-and-first call of the day — and so a test that <em>is</em> about the ceiling has
 * to say so by building its own, where the numbers are visible in the test that depends on them.
 */
public final class TestBudgets {

    private TestBudgets() {
    }

    public static DailyCallBudget unlimited() {
        return new DailyCallBudget(
                new ProtectionProperties(true, false, 100, null, null, null, null, null, null,
                        new ProtectionProperties.Budget(false, null, null, null, null)),
                new SimpleMeterRegistry());
    }
}
