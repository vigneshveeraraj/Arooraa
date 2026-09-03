package com.arooraa.aura.protection;

import com.arooraa.aura.protection.config.ProtectionProperties;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.LongSupplier;

/**
 * One token bucket per caller per surface, with a hard ceiling on how many buckets exist.
 *
 * <h2>Why a bucket rather than a counter</h2>
 * A fixed window ("20 per minute, reset on the minute") lets forty requests through across a window
 * boundary and then refuses a visitor who did nothing wrong at 12:00:59. A bucket refills
 * continuously, so the allowance is the same wherever the clock happens to be, and a visitor who
 * has been quiet for a minute has their full burst back.
 *
 * <h2>Why the map is bounded</h2>
 * The obvious implementation keeps a bucket per caller forever, which turns the thing protecting
 * this service into the easiest way to exhaust its memory: a few million requests from a few
 * million forged addresses and the map is the outage. Buckets are held in access order and the
 * least recently used is dropped past the ceiling. Dropping a bucket is safe in the direction that
 * matters — the caller gets a fresh full one, so the failure is leniency, never a wrong refusal —
 * and a caller busy enough to matter is never the least recently used one.
 *
 * <p>Every method is synchronized on the map. The work inside is arithmetic on a couple of longs;
 * contention here is immaterial next to a database round trip, let alone a call to a model.
 */
public class TokenBucketRateLimiter {

    /** What a caller is told, in the two numbers a client actually needs. */
    public record Decision(boolean allowed, int retryAfterSeconds) {
        static final Decision ALLOWED = new Decision(true, 0);
    }

    private static final class Bucket {
        double tokens;
        long lastRefillMillis;

        Bucket(double tokens, long now) {
            this.tokens = tokens;
            this.lastRefillMillis = now;
        }
    }

    private final LongSupplier clock;
    private final Map<String, Bucket> buckets;

    public TokenBucketRateLimiter(ProtectionProperties properties, LongSupplier clock) {
        this.clock = clock;
        int ceiling = properties.maxTrackedClients();
        this.buckets = new LinkedHashMap<>(16, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, Bucket> eldest) {
                return size() > ceiling;
            }
        };
    }

    /**
     * Takes one token for this caller on this surface.
     *
     * @param key caller and surface together — a visitor asking questions must not spend the
     *        allowance they would need to send their project brief
     */
    public Decision request(String key, ProtectionProperties.Limit limit) {
        long now = clock.getAsLong();
        double perMillisecond = limit.perMinute() / 60_000.0;

        synchronized (buckets) {
            Bucket bucket = buckets.computeIfAbsent(key, ignored -> new Bucket(limit.burst(), now));
            // Refill for the time that has passed, never above the burst ceiling. A clock that
            // jumps backwards adds nothing rather than draining the bucket.
            long elapsed = Math.max(0, now - bucket.lastRefillMillis);
            bucket.tokens = Math.min(limit.burst(), bucket.tokens + elapsed * perMillisecond);
            bucket.lastRefillMillis = now;

            if (bucket.tokens >= 1.0) {
                bucket.tokens -= 1.0;
                return Decision.ALLOWED;
            }
            // Rounded up, and never zero: "try again in 0 seconds" invites an immediate retry that
            // is certain to fail, which is how a limiter turns one impatient client into a loop.
            double secondsToOneToken = (1.0 - bucket.tokens) / (perMillisecond * 1000.0);
            return new Decision(false, Math.max(1, (int) Math.ceil(secondsToOneToken)));
        }
    }

    /** How many callers are currently tracked. For the health surface, and for tests. */
    public int trackedClients() {
        synchronized (buckets) {
            return buckets.size();
        }
    }
}
