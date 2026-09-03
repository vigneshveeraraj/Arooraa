package com.arooraa.aura.insight.domain;

import jakarta.persistence.Column;
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
 * Whether one answer was any use.
 *
 * <p>Keyed on the conversation and the turn, uniquely, so changing your mind updates this row
 * rather than adding another. That matters more than it sounds: a count of "not helpful" should be
 * a count of <em>answers</em> people were unhappy with, not a count of clicks, and those two
 * numbers diverge the moment somebody taps twice.
 */
@Entity
@Table(name = "aura_feedback")
public class AuraFeedback {

    @Id
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "message_sequence", nullable = false)
    private int messageSequence;

    @Enumerated(EnumType.STRING)
    @Column(name = "rating", nullable = false, length = 16)
    private FeedbackRating rating;

    /** Optional, short, and the visitor's own words — bounded at the edge before it reaches here. */
    @Column(name = "reason", length = 300)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected AuraFeedback() {
    }

    public static AuraFeedback of(UUID conversationId, int messageSequence, FeedbackRating rating,
                                   String reason) {
        AuraFeedback feedback = new AuraFeedback();
        feedback.id = UUID.randomUUID();
        feedback.conversationId = conversationId;
        feedback.messageSequence = messageSequence;
        feedback.rating = rating;
        feedback.reason = reason;
        return feedback;
    }

    public void revise(FeedbackRating rating, String reason) {
        this.rating = rating;
        this.reason = reason;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getConversationId() {
        return conversationId;
    }

    public int getMessageSequence() {
        return messageSequence;
    }

    public FeedbackRating getRating() {
        return rating;
    }

    public String getReason() {
        return reason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
