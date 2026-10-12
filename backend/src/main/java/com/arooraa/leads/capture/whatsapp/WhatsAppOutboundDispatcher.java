package com.arooraa.leads.capture.whatsapp;

import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.Accepted;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.RetryableNotAccepted;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.SendOutcome;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.Terminal;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.Unknown;
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

/**
 * Sends one outbox row at a time. (1) Short transaction: claim the participant's oldest due row
 * (FOR UPDATE SKIP LOCKED; skipped while an older row of the same participant is PENDING, RETRY or
 * SENDING, so sends are never parallel or reordered per participant); if the 24h window from the
 * customer's message is closed, mark it EXPIRED for good; otherwise persist SENDING + a lease
 * token. (2) Call the gateway with NO transaction open, correlation id = the row id.
 * (3) Short transaction, guarded by the lease token: ACCEPTED / RETRY (explicitly not accepted,
 * bounded by {@link WhatsAppDeliveryPolicy}) / FAILED / UNKNOWN. UNKNOWN is never resent
 * automatically; a later delivery callback can still prove acceptance (see {@link WhatsAppInbox}).
 * A crash after (1) leaves SENDING, which {@link #recoverStaleSending()} turns into UNKNOWN.
 */
@Component
@ConditionalOnProperty(prefix = "arooraa.whatsapp", name = "outbound-enabled", havingValue = "true")
public class WhatsAppOutboundDispatcher {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppOutboundDispatcher.class);

    private final JdbcTemplate jdbc;
    private final TransactionTemplate tx;
    private final WhatsAppGateway gateway;
    private final Duration lease;

    public WhatsAppOutboundDispatcher(JdbcTemplate jdbc, PlatformTransactionManager transactionManager,
                                      WhatsAppGateway gateway, WhatsAppProperties properties) {
        this.jdbc = jdbc;
        this.tx = new TransactionTemplate(transactionManager);
        this.gateway = gateway;
        Duration callBound = properties.connectTimeout().plus(properties.requestTimeout()).multipliedBy(2);
        this.lease = callBound.compareTo(Duration.ofMinutes(2)) > 0 ? callBound : Duration.ofMinutes(2);
    }

    private record Claim(UUID id, UUID leaseToken, String recipientDigits, String body, int attempt) {
    }

    /** @return true if a row was claimed (sent, expired or failed), false if nothing is due. */
    public boolean dispatchOne() {
        Claim claim = tx.execute(status -> claim());
        if (claim == null) {
            return false;
        }
        if (claim.leaseToken() == null) {
            return true;
        }
        SendOutcome outcome;
        try {
            outcome = gateway.sendText(claim.id(), claim.recipientDigits(), claim.body());
        } catch (RuntimeException e) {
            outcome = new Unknown("GATEWAY_EXCEPTION");
        }
        SendOutcome finalOutcome = outcome != null ? outcome : new Unknown("NO_OUTCOME");
        tx.executeWithoutResult(status -> complete(claim, finalOutcome));
        return true;
    }

    private Claim claim() {
        List<Map<String, Object>> rows = jdbc.queryForList("""
                SELECT o.id, o.recipient_digits, o.body, o.customer_message_at, o.attempt_count
                FROM whatsapp_outbound_messages o
                WHERE o.status IN ('PENDING', 'RETRY') AND o.next_attempt_at <= now()
                  AND NOT EXISTS (SELECT 1 FROM whatsapp_outbound_messages p
                                  WHERE p.participant_hash = o.participant_hash AND p.seq < o.seq
                                    AND p.status IN ('PENDING', 'RETRY', 'SENDING'))
                ORDER BY o.seq
                LIMIT 1
                FOR UPDATE OF o SKIP LOCKED
                """);
        if (rows.isEmpty()) {
            return null;
        }
        Map<String, Object> row = rows.getFirst();
        UUID id = (UUID) row.get("id");
        Instant customerAt = ((Timestamp) row.get("customer_message_at")).toInstant();
        if (!WhatsAppDeliveryPolicy.windowOpen(customerAt, Instant.now())) {
            jdbc.update("""
                    UPDATE whatsapp_outbound_messages SET status = 'EXPIRED', last_error_code = 'WINDOW_EXPIRED',
                        updated_at = now() WHERE id = ?
                    """, id);
            log.warn("whatsapp-outbound blocked id={} reason=WINDOW_EXPIRED", id);
            return new Claim(id, null, null, null, 0);
        }
        UUID leaseToken = UUID.randomUUID();
        int attempt = ((Number) row.get("attempt_count")).intValue() + 1;
        jdbc.update("""
                UPDATE whatsapp_outbound_messages SET status = 'SENDING', attempt_count = ?, lease_token = ?,
                    claimed_at = now(), updated_at = now() WHERE id = ?
                """, attempt, leaseToken, id);
        return new Claim(id, leaseToken, (String) row.get("recipient_digits"), (String) row.get("body"), attempt);
    }

    private void complete(Claim claim, SendOutcome outcome) {
        int updated = switch (outcome) {
            // Also UNKNOWN: the lease may have been reaped while the call was still running.
            case Accepted a -> jdbc.update("""
                    UPDATE whatsapp_outbound_messages SET
                        status = CASE WHEN status IN ('SENDING', 'UNKNOWN') THEN 'ACCEPTED' ELSE status END,
                        meta_message_id = COALESCE(meta_message_id, ?), sent_at = COALESCE(sent_at, now()),
                        last_error_code = NULL, updated_at = now()
                    WHERE id = ? AND lease_token = ?
                    """, a.metaMessageId(), claim.id(), claim.leaseToken());
            case RetryableNotAccepted r -> {
                boolean last = WhatsAppDeliveryPolicy.terminalAttempt(claim.attempt());
                Duration delay = WhatsAppDeliveryPolicy.retryDelay(claim.attempt(), r.retryAfter());
                yield guarded(claim, last ? "FAILED" : "RETRY", r.code(), Instant.now().plus(delay));
            }
            case Terminal t -> guarded(claim, "FAILED", t.code(), Instant.now());
            case Unknown u -> guarded(claim, "UNKNOWN", u.code(), Instant.now());
        };
        log.info("whatsapp-outbound attempt id={} attempt={} outcome={} applied={}",
                claim.id(), claim.attempt(), outcome.getClass().getSimpleName(), updated == 1);
    }

    private int guarded(Claim claim, String status, String code, Instant nextAttemptAt) {
        return jdbc.update("""
                UPDATE whatsapp_outbound_messages SET status = ?, last_error_code = ?, next_attempt_at = ?,
                    updated_at = now()
                WHERE id = ? AND lease_token = ? AND status = 'SENDING'
                """, status, code.length() > 60 ? code.substring(0, 60) : code, Timestamp.from(nextAttemptAt),
                claim.id(), claim.leaseToken());
    }

    /** SENDING past its lease means the process died or hung mid-call: the send may have happened. */
    public int recoverStaleSending() {
        int recovered = jdbc.update("""
                UPDATE whatsapp_outbound_messages SET status = 'UNKNOWN', last_error_code = 'LEASE_EXPIRED',
                    updated_at = now()
                WHERE status = 'SENDING' AND claimed_at < ?
                """, Timestamp.from(Instant.now().minus(lease)));
        if (recovered > 0) {
            log.warn("whatsapp-outbound stale SENDING rows moved to UNKNOWN count={}", recovered);
        }
        return recovered;
    }
}
