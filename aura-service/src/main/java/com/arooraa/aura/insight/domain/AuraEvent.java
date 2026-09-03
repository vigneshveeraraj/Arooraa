package com.arooraa.aura.insight.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * One thing worth counting.
 *
 * <p>Every field is either an enum, a bounded code from our own vocabulary, a number, or a
 * conversation id. There is deliberately no free-text column, so nothing a visitor typed and
 * nothing a model produced can end up here — which is what makes this table safe to read in bulk,
 * export, and keep for longer than a conversation would otherwise deserve.
 *
 * <p>Built through {@link #of} rather than a constructor per shape, because most events populate
 * two or three of these and a builder per combination would be more code than the table has
 * columns.
 */
@Entity
@Table(name = "aura_events")
public class AuraEvent {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 48)
    private AuraEventType eventType;

    @Column(name = "conversation_id")
    private UUID conversationId;

    @Column(name = "mode", length = 32)
    private String mode;

    @Column(name = "evidence_level", length = 32)
    private String evidenceLevel;

    @Column(name = "language", length = 16)
    private String language;

    @Column(name = "channel", length = 32)
    private String channel;

    @Column(name = "page_subject", length = 120)
    private String pageSubject;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "detail", length = 64)
    private String detail;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    protected AuraEvent() {
    }

    public static AuraEvent of(AuraEventType eventType, UUID conversationId) {
        AuraEvent event = new AuraEvent();
        event.id = UUID.randomUUID();
        event.eventType = eventType;
        event.conversationId = conversationId;
        event.occurredAt = Instant.now();
        return event;
    }

    public AuraEvent withRouting(String mode, String evidenceLevel, String language, String channel) {
        this.mode = mode;
        this.evidenceLevel = evidenceLevel;
        this.language = language;
        this.channel = channel;
        return this;
    }

    public AuraEvent withPageSubject(String pageSubject) {
        this.pageSubject = pageSubject;
        return this;
    }

    public AuraEvent withLatency(long latencyMs) {
        this.latencyMs = latencyMs;
        return this;
    }

    /** @param detail a short code from our own vocabulary — never a message, never a provider's text */
    public AuraEvent withDetail(String detail) {
        this.detail = detail == null || detail.length() <= 64 ? detail : detail.substring(0, 64);
        return this;
    }

    public UUID getId() {
        return id;
    }

    public AuraEventType getEventType() {
        return eventType;
    }

    public UUID getConversationId() {
        return conversationId;
    }

    public String getMode() {
        return mode;
    }

    public String getEvidenceLevel() {
        return evidenceLevel;
    }

    public String getLanguage() {
        return language;
    }

    public String getChannel() {
        return channel;
    }

    public String getPageSubject() {
        return pageSubject;
    }

    public Long getLatencyMs() {
        return latencyMs;
    }

    public String getDetail() {
        return detail;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }
}
