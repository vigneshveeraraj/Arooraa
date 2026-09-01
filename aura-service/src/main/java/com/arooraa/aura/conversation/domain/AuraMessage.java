package com.arooraa.aura.conversation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * One stored turn. Visitor turns carry only what the visitor wrote plus the detected language and
 * tone; assistant turns additionally record the mode and evidence level the answer was produced
 * under, which is what makes a past answer explainable later ("why did Aura decline that?").
 *
 * <p>Deliberately absent: the system prompt, the retrieved evidence text, similarity scores, and
 * anything provider-shaped. A transcript is not an audit log of the model call.
 */
@Entity
@Table(name = "aura_messages")
public class AuraMessage {

    @Id
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    /** Dense, per-conversation ordering — see V4 for why this exists instead of sorting on timestamps. */
    @Column(name = "sequence", nullable = false)
    private int sequence;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 16)
    private MessageRole role;

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "language", length = 16)
    private Language language;

    @Enumerated(EnumType.STRING)
    @Column(name = "tone", length = 16)
    private ConversationTone tone;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", length = 32)
    private ConversationMode mode;

    @Column(name = "evidence_level", length = 32)
    private String evidenceLevel;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AuraMessage() {
    }

    public static AuraMessage userTurn(UUID conversationId, int sequence, String content,
                                        Language language, ConversationTone tone) {
        AuraMessage message = new AuraMessage(conversationId, sequence, MessageRole.USER, content);
        message.language = language;
        message.tone = tone;
        return message;
    }

    public static AuraMessage assistantTurn(UUID conversationId, int sequence, String content,
                                             Language language, ConversationTone tone,
                                             ConversationMode mode, String evidenceLevel) {
        AuraMessage message = new AuraMessage(conversationId, sequence, MessageRole.ASSISTANT, content);
        message.language = language;
        message.tone = tone;
        message.mode = mode;
        message.evidenceLevel = evidenceLevel;
        return message;
    }

    private AuraMessage(UUID conversationId, int sequence, MessageRole role, String content) {
        this.id = UUID.randomUUID();
        this.conversationId = conversationId;
        this.sequence = sequence;
        this.role = role;
        this.content = content;
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

    public int getSequence() {
        return sequence;
    }

    public MessageRole getRole() {
        return role;
    }

    public String getContent() {
        return content;
    }

    public Language getLanguage() {
        return language;
    }

    public ConversationTone getTone() {
        return tone;
    }

    public ConversationMode getMode() {
        return mode;
    }

    public String getEvidenceLevel() {
        return evidenceLevel;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
