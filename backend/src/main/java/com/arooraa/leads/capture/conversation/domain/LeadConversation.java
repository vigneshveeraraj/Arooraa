package com.arooraa.leads.capture.conversation.domain;

import com.arooraa.leads.capture.domain.LeadLanguage;
import com.arooraa.leads.capture.domain.LeadLanguageConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.UUID;

/**
 * One scripted conversation with one participant on one channel. The participant is stored only
 * as an HMAC ({@code participantHash}); the number itself lives on the linked lead.
 */
@Entity
@Table(name = "lead_conversations")
public class LeadConversation {

    @Id
    private UUID id;

    @Column(name = "lead_capture_id")
    private UUID leadCaptureId;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private ConversationChannel channel;

    @Column(name = "participant_hash", nullable = false, length = 64)
    private String participantHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 30)
    private ConversationState state;

    @Convert(converter = LeadLanguageConverter.class)
    @Column(name = "language", length = 5)
    private LeadLanguage language;

    @Column(name = "unclear_count", nullable = false)
    private int unclearCount;

    @Column(name = "last_inbound_at")
    private Instant lastInboundAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected LeadConversation() {
    }

    public LeadConversation(ConversationChannel channel, String participantHash) {
        this.id = UUID.randomUUID();
        this.channel = channel;
        this.participantHash = participantHash;
        this.state = ConversationState.AWAITING_LANGUAGE;
    }

    /** Attach (or re-attach) to a lead and start the script from the top. */
    public void startFor(UUID leadCaptureId) {
        this.leadCaptureId = leadCaptureId;
        this.state = ConversationState.AWAITING_LANGUAGE;
        this.language = null;
        this.unclearCount = 0;
    }

    public void advance(ConversationState state, LeadLanguage language, int unclearCount) {
        this.state = state;
        this.language = language;
        this.unclearCount = unclearCount;
    }

    public void recordInbound() {
        this.lastInboundAt = Instant.now();
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getLeadCaptureId() {
        return leadCaptureId;
    }

    public ConversationChannel getChannel() {
        return channel;
    }

    public String getParticipantHash() {
        return participantHash;
    }

    public ConversationState getState() {
        return state;
    }

    public LeadLanguage getLanguage() {
        return language;
    }

    public int getUnclearCount() {
        return unclearCount;
    }

    public Instant getLastInboundAt() {
        return lastInboundAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public long getVersion() {
        return version;
    }
}
