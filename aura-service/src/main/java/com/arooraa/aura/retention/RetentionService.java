package com.arooraa.aura.retention;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Deletes what Aura is no longer entitled to keep (A8).
 *
 * <h2>What goes, and when</h2>
 * A conversation and everything that can only be read as part of it — its messages, its project
 * brief, its feedback — after {@code aura.retention.conversation-days}. Those messages are a
 * visitor's own words, often a description of their business, and there is no reason to hold them
 * once the conversation is over and anything they asked us to act on has become a Start Project
 * enquiry with a life of its own.
 *
 * <p>Counted events last longer, on their own clock, because they contain nothing anybody said.
 * V7 changed their foreign key to {@code ON DELETE SET NULL} so a deleted conversation takes its
 * grouping with it and leaves the counts — which is both the more useful outcome and the more
 * private one.
 *
 * <h2>What is deliberately not deleted</h2>
 * Knowledge gaps. A gap is a question about AROORAA that our own knowledge could not answer; it is
 * a work queue for a person, not a record of a visitor, and deleting it on a timer would quietly
 * discard the thing this service noticed. It holds no contact details and no conversation, and its
 * question is about us.
 *
 * <p>The knowledge corpus is not touched either, ever, by anything here. Nothing in retention has
 * any business near what Aura knows.
 *
 * <h2>Why bulk SQL rather than loading and removing</h2>
 * Ninety days of conversations is not a page of results, and reading them into memory to delete
 * them would be a slow way to run out of it. The cascade is enforced by the database, so one
 * statement removes a conversation and everything hanging off it — which also means the rules live
 * in the schema, where they cannot drift out of step with this class.
 */
@Service
public class RetentionService {

    private static final Logger log = LoggerFactory.getLogger(RetentionService.class);

    @PersistenceContext
    private EntityManager entityManager;

    private final RetentionProperties properties;

    public RetentionService(RetentionProperties properties) {
        this.properties = properties;
    }

    /**
     * Runs a few minutes after start-up and then once a day.
     *
     * <p>Fixed delay rather than a cron expression, deliberately: this has no reason to happen at
     * any particular hour, and a fixed delay cannot pile two runs on top of each other the way a
     * cron can when one takes longer than expected.
     */
    @Scheduled(initialDelayString = "PT5M", fixedDelayString = "P1D")
    public void sweep() {
        if (!properties.enabled()) return;
        Result result = deleteExpired(Instant.now());
        if (result.conversations() > 0 || result.events() > 0) {
            log.info("Aura retention: removed {} conversations and {} events past their window.",
                    result.conversations(), result.events());
        }
    }

    /** @param now injected so a test can be about the boundary rather than about waiting for it */
    @Transactional
    public Result deleteExpired(Instant now) {
        int conversations = entityManager.createNativeQuery("""
                        DELETE FROM aura_conversations WHERE updated_at < :cutoff
                        """)
                .setParameter("cutoff", now.minus(properties.conversationDays(), ChronoUnit.DAYS))
                .executeUpdate();

        int events = entityManager.createNativeQuery("""
                        DELETE FROM aura_events WHERE occurred_at < :cutoff
                        """)
                .setParameter("cutoff", now.minus(properties.eventDays(), ChronoUnit.DAYS))
                .executeUpdate();

        return new Result(conversations, events);
    }

    public record Result(int conversations, int events) {
    }
}
