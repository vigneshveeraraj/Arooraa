package com.arooraa.aura.protection;

import com.arooraa.aura.protection.config.ProtectionProperties;
import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The limiter, against a clock a test owns.
 *
 * <p>Two failures are being guarded against and they pull in opposite directions: a limiter loose
 * enough to be no protection, and one tight enough to refuse a visitor who did nothing wrong. Most
 * of these tests are the second kind.
 */
class TokenBucketRateLimiterTest {

    private final AtomicLong now = new AtomicLong(1_700_000_000_000L);

    private TokenBucketRateLimiter limiter(int maxTrackedClients) {
        return new TokenBucketRateLimiter(
                new ProtectionProperties(true, false, maxTrackedClients,
                        null, null, null, null, null, null, null),
                now::get);
    }

    private static final ProtectionProperties.Limit SIX_A_MINUTE = new ProtectionProperties.Limit(6, 3);

    @Test
    void letsTheBurstThroughAndThenRefuses() {
        TokenBucketRateLimiter limiter = limiter(100);

        for (int request = 0; request < 3; request++) {
            assertThat(limiter.request("visitor|MESSAGES", SIX_A_MINUTE).allowed())
                    .as("request %d of the burst", request + 1)
                    .isTrue();
        }
        assertThat(limiter.request("visitor|MESSAGES", SIX_A_MINUTE).allowed()).isFalse();
    }

    @Test
    void tellsARefusedCallerHowLongToWait() {
        TokenBucketRateLimiter limiter = limiter(100);
        for (int request = 0; request < 3; request++) limiter.request("visitor|MESSAGES", SIX_A_MINUTE);

        TokenBucketRateLimiter.Decision refused = limiter.request("visitor|MESSAGES", SIX_A_MINUTE);

        // Six a minute is one every ten seconds. Never zero: "try again in 0 seconds" invites the
        // immediate retry that turns one impatient client into a loop.
        assertThat(refused.retryAfterSeconds()).isBetween(1, 10);
    }

    @Test
    void refillsAsTimePasses() {
        TokenBucketRateLimiter limiter = limiter(100);
        for (int request = 0; request < 3; request++) limiter.request("visitor|MESSAGES", SIX_A_MINUTE);
        assertThat(limiter.request("visitor|MESSAGES", SIX_A_MINUTE).allowed()).isFalse();

        now.addAndGet(10_000);

        assertThat(limiter.request("visitor|MESSAGES", SIX_A_MINUTE).allowed()).isTrue();
    }

    @Test
    void neverRefillsPastTheBurst() {
        // An hour of silence does not earn an hour's worth of requests. Otherwise the limit is the
        // rate on average and no limit at all in the moment, which is the moment that matters.
        TokenBucketRateLimiter limiter = limiter(100);
        now.addAndGet(3_600_000);

        for (int request = 0; request < 3; request++) {
            assertThat(limiter.request("visitor|MESSAGES", SIX_A_MINUTE).allowed()).isTrue();
        }
        assertThat(limiter.request("visitor|MESSAGES", SIX_A_MINUTE).allowed()).isFalse();
    }

    @Test
    void keepsOneCallersUseOffAnothersAllowance() {
        TokenBucketRateLimiter limiter = limiter(100);
        for (int request = 0; request < 3; request++) limiter.request("noisy|MESSAGES", SIX_A_MINUTE);

        assertThat(limiter.request("somebody-else|MESSAGES", SIX_A_MINUTE).allowed()).isTrue();
    }

    @Test
    void keepsOneSurfacesUseOffAnothers() {
        // The failure this prevents: a visitor who has been asking questions finds they cannot send
        // the project brief they just spent five minutes on.
        TokenBucketRateLimiter limiter = limiter(100);
        for (int request = 0; request < 3; request++) limiter.request("visitor|MESSAGES", SIX_A_MINUTE);

        assertThat(limiter.request("visitor|HANDOFF", SIX_A_MINUTE).allowed()).isTrue();
    }

    @Test
    void cannotBeMadeToRememberAnUnboundedNumberOfCallers() {
        // The limiter's own bookkeeping must not become the cheapest way to exhaust this service's
        // memory — which is exactly what a map keyed on a forgeable address would be.
        TokenBucketRateLimiter limiter = limiter(50);

        for (int caller = 0; caller < 5_000; caller++) {
            limiter.request("forged-" + caller + "|MESSAGES", SIX_A_MINUTE);
        }

        assertThat(limiter.trackedClients()).isLessThanOrEqualTo(50);
    }

    @Test
    void forgetsTheLeastRecentlyActiveCallerRatherThanTheBusiestOne() {
        // Eviction has to fail towards leniency and towards the wrong caller: a forgotten bucket is
        // a full one, so the cost of being evicted is never a wrongly refused request — and the
        // caller worth remembering is never the one that has been quiet longest.
        TokenBucketRateLimiter limiter = limiter(3);
        limiter.request("busy|MESSAGES", SIX_A_MINUTE);
        limiter.request("quiet|MESSAGES", SIX_A_MINUTE);
        limiter.request("busy|MESSAGES", SIX_A_MINUTE);
        limiter.request("busy|MESSAGES", SIX_A_MINUTE);

        limiter.request("new-1|MESSAGES", SIX_A_MINUTE);
        limiter.request("new-2|MESSAGES", SIX_A_MINUTE);

        // "busy" has spent its burst and is still being counted; "quiet" was dropped.
        assertThat(limiter.request("busy|MESSAGES", SIX_A_MINUTE).allowed()).isFalse();
        assertThat(limiter.request("quiet|MESSAGES", SIX_A_MINUTE).allowed()).isTrue();
    }

    @Test
    void survivesAClockThatMovesBackwards() {
        // NTP corrections happen. Refilling by a negative elapsed time would drain the bucket and
        // refuse a visitor for something the server did.
        TokenBucketRateLimiter limiter = limiter(100);
        limiter.request("visitor|MESSAGES", SIX_A_MINUTE);
        now.addAndGet(-60_000);

        assertThat(limiter.request("visitor|MESSAGES", SIX_A_MINUTE).allowed()).isTrue();
        assertThat(limiter.request("visitor|MESSAGES", SIX_A_MINUTE).allowed()).isTrue();
    }

    @Test
    void treatsABurstSmallerThanOneAsTheRateItself() {
        // Configuration mistakes should widen a limit rather than lock a surface: a burst of zero
        // read literally would refuse the very first request anybody ever made.
        ProtectionProperties.Limit noBurst = new ProtectionProperties.Limit(30, 0);

        assertThat(noBurst.burst()).isEqualTo(30);
        assertThat(limiter(100).request("visitor|MESSAGES", noBurst).allowed()).isTrue();
    }
}
