package com.arooraa.leads.capture.whatsapp;

import com.arooraa.leads.capture.conversation.LeadConversationService;
import com.arooraa.leads.capture.conversation.LeadConversationService.InboundMessage;
import com.arooraa.leads.capture.conversation.LeadConversationService.OutboundReply;
import com.arooraa.leads.capture.conversation.domain.ConversationChannel;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Turns one accepted inbox row into a conversation turn. In ONE local transaction: claim the
 * participant's oldest unfinished message (FOR UPDATE SKIP LOCKED; a newer message is never taken
 * while an older one of the same participant is PENDING/RETRY), take a transaction-scoped
 * advisory lock on the participant (serialises processors, so two first messages cannot race to
 * create the conversation), run {@link LeadConversationService} through its proxy (joins this
 * transaction), enqueue each guarded reply in the outbox and mark the row PROCESSED. Any failure
 * rolls all of it back; the failure is then recorded in a separate transaction with bounded
 * backoff, and after {@link #MAX_ATTEMPTS} the row goes DEAD (operator runbook). DEAD rows no
 * longer block the participant's later messages. No network call happens here.
 */
@Component
@ConditionalOnProperty(prefix = "arooraa.whatsapp", name = "enabled", havingValue = "true")
public class WhatsAppInboundProcessor {

    static final int MAX_ATTEMPTS = 5;
    private static final List<Duration> BACKOFF = List.of(
            Duration.ofSeconds(30), Duration.ofMinutes(2), Duration.ofMinutes(10), Duration.ofMinutes(30));
    private static final int MAX_OUTBOUND_BODY = 4096;
    private static final Logger log = LoggerFactory.getLogger(WhatsAppInboundProcessor.class);

    private final JdbcTemplate jdbc;
    private final TransactionTemplate tx;
    private final LeadConversationService conversations;
    private final EntityManager entityManager;

    public WhatsAppInboundProcessor(JdbcTemplate jdbc, PlatformTransactionManager transactionManager,
                                    LeadConversationService conversations, EntityManager entityManager) {
        this.jdbc = jdbc;
        this.tx = new TransactionTemplate(transactionManager);
        this.conversations = conversations;
        this.entityManager = entityManager;
    }

    /** @return true if a row was claimed (processed or failed), false if nothing is due. */
    public boolean processOne() {
        AtomicReference<UUID> claimedId = new AtomicReference<>();
        try {
            return Boolean.TRUE.equals(tx.execute(status -> {
                List<Map<String, Object>> rows = jdbc.queryForList("""
                        SELECT i.id, i.phone_number_id, i.wamid, i.participant_phone, i.participant_hash, i.body,
                               LEAST(i.source_timestamp, i.received_at) AS customer_message_at
                        FROM whatsapp_inbound_messages i
                        WHERE i.status IN ('PENDING', 'RETRY') AND i.next_attempt_at <= now()
                          AND NOT EXISTS (SELECT 1 FROM whatsapp_inbound_messages o
                                          WHERE o.participant_hash = i.participant_hash
                                            AND o.status IN ('PENDING', 'RETRY')
                                            AND (o.source_timestamp, o.seq) < (i.source_timestamp, i.seq))
                        ORDER BY i.source_timestamp, i.seq
                        LIMIT 1
                        FOR UPDATE OF i SKIP LOCKED
                        """);
                if (rows.isEmpty()) {
                    return false;
                }
                Map<String, Object> row = rows.getFirst();
                UUID id = (UUID) row.get("id");
                claimedId.set(id);
                String participantHash = (String) row.get("participant_hash");
                jdbc.query("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))", rs -> { }, "wa-in:" + participantHash);

                String phone = (String) row.get("participant_phone");
                LeadConversationService.Result result = conversations.handle(new InboundMessage(
                        ConversationChannel.WHATSAPP, phone, (String) row.get("wamid"), (String) row.get("body")));
                entityManager.flush();
                for (OutboundReply reply : result.replies()) {
                    String body = reply.body().length() > MAX_OUTBOUND_BODY
                            ? reply.body().substring(0, MAX_OUTBOUND_BODY) : reply.body();
                    jdbc.update("""
                            INSERT INTO whatsapp_outbound_messages (id, inbound_message_id, conversation_message_id,
                                phone_number_id, participant_hash, recipient_digits, body, customer_message_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """, UUID.randomUUID(), id, reply.messageId(), row.get("phone_number_id"), participantHash,
                            phone.substring(1), body, row.get("customer_message_at"));
                }
                jdbc.update("""
                        UPDATE whatsapp_inbound_messages SET status = 'PROCESSED', processed_at = now(),
                            attempt_count = attempt_count + 1, last_error_code = NULL, updated_at = now()
                        WHERE id = ?
                        """, id);
                log.info("whatsapp-inbound processed id={} duplicate={} replies={}",
                        id, result.duplicate(), result.replies().size());
                return true;
            }));
        } catch (RuntimeException e) {
            UUID id = claimedId.get();
            if (id == null) {
                log.warn("whatsapp-inbound claim failed error={}", e.getClass().getSimpleName());
                return false;
            }
            recordFailure(id, e.getClass().getSimpleName());
            return true;
        }
    }

    private void recordFailure(UUID id, String errorCode) {
        tx.executeWithoutResult(status -> {
            List<Integer> attempts = jdbc.queryForList(
                    "SELECT attempt_count FROM whatsapp_inbound_messages WHERE id = ? AND status IN ('PENDING', 'RETRY') FOR UPDATE",
                    Integer.class, id);
            if (attempts.isEmpty()) {
                return;
            }
            int attempt = attempts.getFirst() + 1;
            boolean dead = attempt >= MAX_ATTEMPTS;
            Duration delay = BACKOFF.get(Math.min(attempt, BACKOFF.size()) - 1);
            jdbc.update("""
                    UPDATE whatsapp_inbound_messages SET status = ?, attempt_count = ?, next_attempt_at = ?,
                        last_error_code = ?, updated_at = now()
                    WHERE id = ?
                    """, dead ? "DEAD" : "RETRY", attempt, Timestamp.from(Instant.now().plus(delay)),
                    errorCode.length() > 60 ? errorCode.substring(0, 60) : errorCode, id);
            log.warn("whatsapp-inbound failed id={} attempt={} status={} error={}",
                    id, attempt, dead ? "DEAD" : "RETRY", errorCode);
        });
    }
}
