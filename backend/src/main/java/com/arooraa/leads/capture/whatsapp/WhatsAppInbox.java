package com.arooraa.leads.capture.whatsapp;

import com.arooraa.leads.capture.whatsapp.MetaWebhookDecoder.Decoded;
import com.arooraa.leads.capture.whatsapp.MetaWebhookDecoder.InboundText;
import com.arooraa.leads.capture.whatsapp.MetaWebhookDecoder.StatusUpdate;
import com.arooraa.leads.service.IpHasher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * The webhook's only side effect: in ONE local transaction, insert each new inbound message
 * (dedup on (phone_number_id, wamid) with ON CONFLICT DO NOTHING, so concurrent redeliveries are
 * atomic no-ops and a changed payload under a known id never overwrites the original) and apply
 * each delivery status to the outbox. No conversation, model or network call happens here.
 */
@Component
public class WhatsAppInbox {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppInbox.class);

    private final JdbcTemplate jdbc;
    private final IpHasher participantHasher;
    private final WhatsAppProperties properties;

    public WhatsAppInbox(JdbcTemplate jdbc, IpHasher participantHasher, WhatsAppProperties properties) {
        this.jdbc = jdbc;
        this.participantHasher = participantHasher;
        this.properties = properties;
    }

    public record Accepted(int inserted, int duplicates, int conflicts, int statusesApplied) {
    }

    @Transactional
    public Accepted accept(Decoded decoded) {
        int inserted = 0, duplicates = 0, conflicts = 0, applied = 0;
        for (InboundText m : decoded.messages()) {
            int rows = jdbc.update("""
                    INSERT INTO whatsapp_inbound_messages (id, phone_number_id, wamid, participant_phone,
                        participant_hash, body, payload_sha256, source_timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT (phone_number_id, wamid) DO NOTHING
                    """, UUID.randomUUID(), properties.phoneNumberId(), m.wamid(), m.participantPhone(),
                    participantHasher.hash("WHATSAPP:" + m.participantPhone()), m.text(), m.fingerprint(),
                    Timestamp.from(m.sourceTimestamp()));
            if (rows == 1) {
                inserted++;
                continue;
            }
            String existing = jdbc.queryForObject(
                    "SELECT payload_sha256 FROM whatsapp_inbound_messages WHERE phone_number_id = ? AND wamid = ?",
                    String.class, properties.phoneNumberId(), m.wamid());
            if (m.fingerprint().equals(existing)) {
                duplicates++;
            } else {
                conflicts++;
            }
        }
        for (StatusUpdate s : decoded.statuses()) {
            applied += applyStatus(s) ? 1 : 0;
        }
        if (conflicts > 0) {
            log.warn("whatsapp-inbox redelivery with altered content ignored count={}", conflicts);
        }
        log.info("whatsapp-inbox accepted inserted={} duplicates={} statuses={}/{} ignored={}",
                inserted, duplicates, applied, decoded.statuses().size(), decoded.ignored());
        return new Accepted(inserted, duplicates, conflicts, applied);
    }

    /**
     * Matches only our own, already-attempted outbound rows for this account AND this recipient,
     * by Meta id or — when the callback beats the send response — by our correlation id while no
     * Meta id is recorded yet. Anything else in a status callback is ignored.
     */
    private boolean applyStatus(StatusUpdate s) {
        String match = s.callbackId() == null
                ? "meta_message_id = ?"
                : "(meta_message_id = ? OR (meta_message_id IS NULL AND id = ?))";
        Object[] args = s.callbackId() == null
                ? new Object[]{properties.phoneNumberId(), s.recipientDigits(), s.wamid()}
                : new Object[]{properties.phoneNumberId(), s.recipientDigits(), s.wamid(), s.callbackId()};
        List<Map<String, Object>> rows = jdbc.queryForList("""
                SELECT id, delivery_status FROM whatsapp_outbound_messages
                WHERE phone_number_id = ? AND recipient_digits = ? AND attempt_count > 0 AND %s
                FOR UPDATE
                """.formatted(match), args);
        if (rows.size() != 1) {
            return false;
        }
        String current = (String) rows.getFirst().get("delivery_status");
        String next = nextDeliveryStatus(current, s.status());
        boolean failedNow = "failed".equals(next) && !"failed".equals(current);
        jdbc.update("""
                UPDATE whatsapp_outbound_messages SET
                    status = CASE WHEN status IN ('SENDING', 'UNKNOWN', 'RETRY', 'FAILED') THEN 'ACCEPTED' ELSE status END,
                    meta_message_id = COALESCE(meta_message_id, ?),
                    sent_at = COALESCE(sent_at, now()),
                    delivery_status = ?,
                    delivery_error_code = CASE WHEN ? THEN ? ELSE delivery_error_code END,
                    delivery_updated_at = now(), updated_at = now()
                WHERE id = ?
                """, s.wamid(), next, failedNow, s.errorCode(), rows.getFirst().get("id"));
        return true;
    }

    /** sent < delivered < read; failed only replaces none/sent; nothing moves backwards or out of failed. */
    static String nextDeliveryStatus(String current, String incoming) {
        if ("failed".equals(current)) {
            return current;
        }
        if ("failed".equals(incoming)) {
            return current == null || "sent".equals(current) ? incoming : current;
        }
        return WhatsAppDeliveryPolicy.deliveryRank(incoming) > WhatsAppDeliveryPolicy.deliveryRank(current)
                ? incoming : current;
    }
}
