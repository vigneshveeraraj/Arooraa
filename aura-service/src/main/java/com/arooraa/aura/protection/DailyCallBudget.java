package com.arooraa.aura.protection;

import com.arooraa.aura.protection.config.ProtectionProperties;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.EnumMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * How much Aura may spend in a day, counted in provider calls (A8).
 *
 * <p>Rate limiting stops one caller doing too much. It does not stop a thousand callers each doing
 * a reasonable amount on a day when the site is on the front page of something, and the bill for
 * that arrives a month later. This is the ceiling for that day.
 *
 * <h2>Calls, not currency</h2>
 * This service knows exactly how many calls it made and cannot know what any of them cost — pricing
 * lives at the provider and changes without telling us. A ceiling in calls is enforceable and
 * auditable. A ceiling in dollars would be a guess wearing the costume of a control, and would read
 * as a stronger promise than it could keep.
 *
 * <h2>Exhaustion is not an error</h2>
 * Every caller of this class already has a path for "the provider is not available", because every
 * one of them had to handle a provider being switched off. Reaching the ceiling takes that path:
 * Aura says it cannot do that just now, in her own words, and the conversation carries on. Nobody
 * is shown a budget, because the state of AROORAA's spending is not a visitor's business.
 *
 * <h2>In memory, and per instance</h2>
 * The count lives in this process and resets when it restarts. That is the honest trade for a
 * single-instance deployment: a database counter would be a write on the hot path of every turn to
 * defend against a case — several instances of Aura — that does not exist and will be a deliberate
 * decision when it does. The runbook says so, so that nobody discovers it during an incident.
 */
@Component
public class DailyCallBudget {

    private static final Logger log = LoggerFactory.getLogger(DailyCallBudget.class);

    /** What is being spent on. Separate ceilings because they fail differently and cost differently. */
    public enum Kind {
        CHAT, TRANSCRIPTION, SYNTHESIS, EXTRACTION
    }

    private final ProtectionProperties.Budget budget;
    private final Clock clock;
    private final MeterRegistry meterRegistry;

    private final Map<Kind, AtomicLong> spent = new EnumMap<>(Kind.class);
    /**
     * Which kinds have already been announced today. Without this, a ceiling reached at noon logs
     * a warning for every request until midnight — and a log that repeats itself thousands of times
     * is a log nobody reads on the day something else goes wrong.
     */
    private final Map<Kind, Boolean> announced = new EnumMap<>(Kind.class);
    private volatile LocalDate day;

    // Annotated because the package-private constructor below is also a candidate, and a test hook
    // must never be the thing the container picks.
    @Autowired
    public DailyCallBudget(ProtectionProperties properties, MeterRegistry meterRegistry) {
        this(properties, meterRegistry, Clock.systemUTC());
    }

    /** @param clock injected so a test can be about the day boundary rather than about waiting */
    DailyCallBudget(ProtectionProperties properties, MeterRegistry meterRegistry, Clock clock) {
        this.budget = properties.budget();
        this.meterRegistry = meterRegistry;
        this.clock = clock;
        this.day = LocalDate.now(clock);
        for (Kind kind : Kind.values()) {
            spent.put(kind, new AtomicLong());
            // Registered up front so a dashboard has a line at zero rather than a gap, and so
            // "nothing was spent" is distinguishable from "nothing is reporting".
            meterRegistry.gauge("aura.protection.budget.spent", io.micrometer.core.instrument.Tags.of("kind", kind.name()),
                    spent.get(kind), AtomicLong::doubleValue);
        }
    }

    /**
     * Takes one call from today's allowance.
     *
     * @return true if the call may go ahead. False means the ceiling is reached, and the caller
     *         should take whichever path it already has for an unavailable provider
     */
    public boolean tryConsume(Kind kind) {
        if (!budget.enabled()) return true;

        rollOverIfNewDay();
        long ceiling = ceilingFor(kind);
        long used = spent.get(kind).incrementAndGet();
        if (used <= ceiling) return true;

        // Held at the ceiling rather than left to climb, so the number a dashboard shows stays the
        // number that was actually spent.
        spent.get(kind).decrementAndGet();
        meterRegistry.counter("aura.protection.budget.refused", "kind", kind.name()).increment();
        announceOnce(kind, ceiling);
        return false;
    }

    /**
     * Says it once per kind per day, at warn, because somebody needs to see it: either the day was
     * extraordinary or the ceiling is wrong, and both deserve a person's attention. The counter
     * carries the volume; the log carries the news.
     */
    private void announceOnce(Kind kind, long ceiling) {
        synchronized (announced) {
            if (Boolean.TRUE.equals(announced.get(kind))) return;
            announced.put(kind, true);
        }
        log.warn("Daily {} budget of {} reached — Aura will decline this kind of work until tomorrow.",
                kind, ceiling);
    }

    /** What has been spent today, for the health surface. Never per-visitor, only per kind. */
    public long spent(Kind kind) {
        rollOverIfNewDay();
        return spent.get(kind).get();
    }

    public long ceilingFor(Kind kind) {
        return switch (kind) {
            case CHAT -> budget.chatCallsPerDay();
            case TRANSCRIPTION -> budget.transcriptionCallsPerDay();
            case SYNTHESIS -> budget.synthesisCallsPerDay();
            case EXTRACTION -> budget.extractionCallsPerDay();
        };
    }

    /**
     * UTC, deliberately. A day boundary that moves with a server's local time zone is a day
     * boundary that moves when the server does, and the ceilings would quietly change meaning.
     */
    private void rollOverIfNewDay() {
        LocalDate today = LocalDate.now(clock);
        if (today.equals(day)) return;
        synchronized (this) {
            if (today.equals(day)) return;
            spent.values().forEach(counter -> counter.set(0));
            synchronized (announced) {
                announced.clear();
            }
            day = today;
        }
    }

    public LocalDate day() {
        return day;
    }

    /** The zone the day boundary follows, stated so the runbook and the code cannot disagree. */
    public static ZoneOffset zone() {
        return ZoneOffset.UTC;
    }
}
