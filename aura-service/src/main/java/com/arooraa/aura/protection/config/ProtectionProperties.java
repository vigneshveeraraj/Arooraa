package com.arooraa.aura.protection.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Abuse and cost limits (A8).
 *
 * <p>Every limit here has a default, and the defaults are the ones a public deployment should
 * actually run with rather than placeholders. A limit nobody sets is the limit that matters, and
 * this service will one day be reachable from the open internet.
 *
 * @param enabled whether the rate limiter runs at all. On by default: this is a protection, and
 *        protections that default off are protections that are missing on the day they are needed
 * @param trustProxyHeaders whether {@code X-Forwarded-For} may name the client. Off by default,
 *        because when it is on and there is no proxy in front, every caller can choose their own
 *        identity and the limiter counts nothing
 * @param maxTrackedClients how many distinct callers are remembered at once, so the limiter's own
 *        bookkeeping cannot become the memory-exhaustion attack it exists to prevent
 */
@ConfigurationProperties(prefix = "aura.protection")
public record ProtectionProperties(
        Boolean enabled,
        Boolean trustProxyHeaders,
        Integer maxTrackedClients,
        Limit conversations,
        Limit messages,
        Limit voice,
        Limit brief,
        Limit handoff,
        Limit other,
        Budget budget) {

    /**
     * One surface's allowance.
     *
     * @param perMinute the sustained rate
     * @param burst how many may arrive at once. Separate from the rate because people do not
     *        arrive at a steady tempo — a visitor opening Aura and immediately asking two things
     *        is normal, and a limiter that only understands averages punishes them for it
     */
    public record Limit(Integer perMinute, Integer burst) {
        public Limit {
            perMinute = perMinute == null || perMinute < 1 ? 60 : perMinute;
            burst = burst == null || burst < 1 ? perMinute : burst;
        }
    }

    /**
     * What Aura may spend in a day, counted in provider calls rather than money.
     *
     * <p>Calls are the honest unit here: this service knows exactly how many it made and cannot
     * know what any of them cost, since pricing lives at the provider and changes without us.
     * A ceiling in calls is enforceable and auditable; a ceiling in dollars would be a guess
     * presented as a control.
     *
     * <p>Reaching a ceiling is not an error. Aura says it cannot do that just now — the same
     * sentence it uses when a provider is switched off — and the conversation continues.
     *
     * @param enabled whether the ceilings apply
     * @param chatCallsPerDay generations, the largest and most frequent cost
     * @param transcriptionCallsPerDay speech in
     * @param synthesisCallsPerDay speech out
     * @param extractionCallsPerDay brief extractions, which a visitor can trigger repeatedly by
     *        correcting their brief, and so needs its own ceiling rather than sharing chat's
     */
    public record Budget(Boolean enabled, Integer chatCallsPerDay, Integer transcriptionCallsPerDay,
                          Integer synthesisCallsPerDay, Integer extractionCallsPerDay) {
        public Budget {
            enabled = enabled == null || enabled;
            chatCallsPerDay = positiveOr(chatCallsPerDay, 2_000);
            transcriptionCallsPerDay = positiveOr(transcriptionCallsPerDay, 1_000);
            synthesisCallsPerDay = positiveOr(synthesisCallsPerDay, 1_000);
            extractionCallsPerDay = positiveOr(extractionCallsPerDay, 300);
        }
    }

    public ProtectionProperties {
        enabled = enabled == null || enabled;
        trustProxyHeaders = trustProxyHeaders != null && trustProxyHeaders;
        maxTrackedClients = positiveOr(maxTrackedClients, 10_000);
        // Ordered by what each one costs us. Opening a conversation is a row; asking a question is
        // a generation; speaking is a generation and an audio file; a handoff creates something a
        // person has to read.
        conversations = conversations == null ? new Limit(20, 5) : conversations;
        messages = messages == null ? new Limit(20, 6) : messages;
        voice = voice == null ? new Limit(12, 4) : voice;
        brief = brief == null ? new Limit(6, 3) : brief;
        handoff = handoff == null ? new Limit(3, 2) : handoff;
        other = other == null ? new Limit(60, 20) : other;
        budget = budget == null ? new Budget(true, null, null, null, null) : budget;
    }

    private static Integer positiveOr(Integer value, int fallback) {
        return value == null || value < 1 ? fallback : value;
    }
}
