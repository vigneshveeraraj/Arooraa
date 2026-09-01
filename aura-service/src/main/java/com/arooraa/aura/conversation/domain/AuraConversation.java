package com.arooraa.aura.conversation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.UUID;

/**
 * One chat session with Aura. Holds the routing context a conversation was opened under — which
 * assistant profile and channel — because those decide knowledge access for every turn in it, and
 * must not be re-supplied (and therefore re-negotiated) by the client on each message.
 *
 * <p>{@link #getPublicId()} is the only identifier that ever leaves the service.
 */
@Entity
@Table(name = "aura_conversations")
public class AuraConversation {

    @Id
    private UUID id;

    @Column(name = "public_id", nullable = false, unique = true)
    private UUID publicId;

    @Column(name = "assistant_profile", nullable = false, length = 64)
    private String assistantProfile;

    @Column(name = "channel", nullable = false, length = 64)
    private String channel;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected AuraConversation() {
    }

    public AuraConversation(String assistantProfile, String channel) {
        this.id = UUID.randomUUID();
        this.publicId = UUID.randomUUID();
        this.assistantProfile = assistantProfile;
        this.channel = channel;
    }

    /** Marks activity so a future retention job has a truthful "last used" to work from. */
    public void touch() {
        this.updatedAt = Instant.now();
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

    public UUID getPublicId() {
        return publicId;
    }

    public String getAssistantProfile() {
        return assistantProfile;
    }

    public String getChannel() {
        return channel;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Optimistic-locking version. Exposed so the guarantee can be asserted rather than assumed —
     * "every turn is a write, and a write from a version that has moved on is refused" is a
     * property {@code ConversationPersistenceIT} checks directly.
     */
    public long getVersion() {
        return version;
    }
}
