package com.arooraa.leads.contact.notification.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * One delivery intent for an already-persisted {@link com.arooraa.leads.contact.domain.ContactMessage},
 * referenced by id only. Structurally identical to {@code RecruitmentNotificationOutbox} /
 * {@code NotificationOutbox} — its own class/table so Contact notification volume and failures
 * never mix with recruitment or sales.
 */
@Entity
@Table(name = "contact_message_notification_outbox")
public class ContactNotificationOutbox {

    @Id
    private UUID id;

    @Column(name = "contact_message_id", nullable = false)
    private UUID contactMessageId;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 30)
    private ContactNotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ContactNotificationOutboxStatus status;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "next_attempt_at", nullable = false)
    private Instant nextAttemptAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "processing_started_at")
    private Instant processingStartedAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "last_error_code", length = 60)
    private String lastErrorCode;

    @Column(name = "last_error_summary", length = 500)
    private String lastErrorSummary;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected ContactNotificationOutbox() {
    }

    public ContactNotificationOutbox(UUID contactMessageId, ContactNotificationType notificationType) {
        this.id = UUID.randomUUID();
        this.contactMessageId = contactMessageId;
        this.notificationType = notificationType;
        this.status = ContactNotificationOutboxStatus.PENDING;
        this.attemptCount = 0;
        this.nextAttemptAt = Instant.now();
    }

    public void markProcessing() {
        this.status = ContactNotificationOutboxStatus.PROCESSING;
        this.processingStartedAt = Instant.now();
        this.attemptCount += 1;
    }

    public void markSent() {
        this.status = ContactNotificationOutboxStatus.SENT;
        this.sentAt = Instant.now();
        this.processingStartedAt = null;
        this.lastErrorCode = null;
        this.lastErrorSummary = null;
    }

    public void markRetry(Duration delay, String errorCode, String errorSummary) {
        this.status = ContactNotificationOutboxStatus.RETRY;
        this.nextAttemptAt = Instant.now().plus(delay);
        this.processingStartedAt = null;
        this.lastErrorCode = errorCode;
        this.lastErrorSummary = errorSummary;
    }

    public void markFailed(String errorCode, String errorSummary) {
        this.status = ContactNotificationOutboxStatus.FAILED;
        this.processingStartedAt = null;
        this.lastErrorCode = errorCode;
        this.lastErrorSummary = errorSummary;
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

    public UUID getContactMessageId() {
        return contactMessageId;
    }

    public ContactNotificationType getNotificationType() {
        return notificationType;
    }

    public ContactNotificationOutboxStatus getStatus() {
        return status;
    }

    public int getAttemptCount() {
        return attemptCount;
    }

    public Instant getNextAttemptAt() {
        return nextAttemptAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getProcessingStartedAt() {
        return processingStartedAt;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public String getLastErrorCode() {
        return lastErrorCode;
    }

    public String getLastErrorSummary() {
        return lastErrorSummary;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public long getVersion() {
        return version;
    }
}
