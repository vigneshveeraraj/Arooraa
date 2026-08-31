package com.arooraa.leads.project.notification.domain;

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
 * One delivery intent for an already-persisted {@link com.arooraa.leads.project.domain.ProjectEnquiry},
 * referenced by id only — never a copy of the enquiry payload (W3.2C §7). Rows are created inside
 * the same transaction as the enquiry insert (see LeadNotificationService) and are picked up later,
 * out of band, by NotificationOutboxWorker.
 */
@Entity
@Table(name = "project_enquiry_notification_outbox")
public class NotificationOutbox {

    @Id
    private UUID id;

    @Column(name = "project_enquiry_id", nullable = false)
    private UUID projectEnquiryId;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 30)
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private NotificationOutboxStatus status;

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

    protected NotificationOutbox() {
    }

    public NotificationOutbox(UUID projectEnquiryId, NotificationType notificationType) {
        this.id = UUID.randomUUID();
        this.projectEnquiryId = projectEnquiryId;
        this.notificationType = notificationType;
        this.status = NotificationOutboxStatus.PENDING;
        this.attemptCount = 0;
        this.nextAttemptAt = Instant.now();
    }

    /** Claimed by a worker transaction; the row lock backing this claim is released on commit
     *  (success/retry/failure) or, if the process dies mid-send, on connection loss — so this
     *  status never survives a crash uncommitted (W3.2C §36). */
    public void markProcessing() {
        this.status = NotificationOutboxStatus.PROCESSING;
        this.processingStartedAt = Instant.now();
        this.attemptCount += 1;
    }

    public void markSent() {
        this.status = NotificationOutboxStatus.SENT;
        this.sentAt = Instant.now();
        this.processingStartedAt = null;
        this.lastErrorCode = null;
        this.lastErrorSummary = null;
    }

    public void markRetry(Duration delay, String errorCode, String errorSummary) {
        this.status = NotificationOutboxStatus.RETRY;
        this.nextAttemptAt = Instant.now().plus(delay);
        this.processingStartedAt = null;
        this.lastErrorCode = errorCode;
        this.lastErrorSummary = errorSummary;
    }

    public void markFailed(String errorCode, String errorSummary) {
        this.status = NotificationOutboxStatus.FAILED;
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

    public UUID getProjectEnquiryId() {
        return projectEnquiryId;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public NotificationOutboxStatus getStatus() {
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
