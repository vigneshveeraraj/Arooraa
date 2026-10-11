package com.arooraa.leads.capture.conversation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** One message in a lead conversation, kept so the team picking up a handoff can read what was said. */
@Entity
@Table(name = "lead_conversation_messages")
public class LeadConversationMessage {

    public static final int MAX_BODY_LENGTH = 2000;

    @Id
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false, length = 10)
    private MessageDirection direction;

    @Column(name = "body", nullable = false, length = MAX_BODY_LENGTH)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "interpreted_by", length = 10)
    private InterpretationSource interpretedBy;

    @Column(name = "external_message_id", length = 200)
    private String externalMessageId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected LeadConversationMessage() {
    }

    private LeadConversationMessage(UUID conversationId, MessageDirection direction, String body,
                                    String externalMessageId) {
        this.id = UUID.randomUUID();
        this.conversationId = conversationId;
        this.direction = direction;
        this.body = body.length() > MAX_BODY_LENGTH ? body.substring(0, MAX_BODY_LENGTH) : body;
        this.externalMessageId = externalMessageId;
    }

    public static LeadConversationMessage inbound(UUID conversationId, String body, String externalMessageId) {
        return new LeadConversationMessage(conversationId, MessageDirection.INBOUND, body, externalMessageId);
    }

    public static LeadConversationMessage outbound(UUID conversationId, String body) {
        return new LeadConversationMessage(conversationId, MessageDirection.OUTBOUND, body, null);
    }

    public void recordInterpretation(InterpretationSource source) {
        this.interpretedBy = source;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getConversationId() {
        return conversationId;
    }

    public MessageDirection getDirection() {
        return direction;
    }

    public String getBody() {
        return body;
    }

    public InterpretationSource getInterpretedBy() {
        return interpretedBy;
    }

    public String getExternalMessageId() {
        return externalMessageId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
