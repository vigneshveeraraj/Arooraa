package com.arooraa.leads.careers.notification.domain;

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
 * One delivery intent for an already-persisted
 * {@link com.arooraa.leads.careers.domain.JobApplication}, referenced by id only — never a copy
 * of the application payload. Rows are created inside the same transaction as the application
 * insert (see JobApplicationNotificationService) and picked up later, out of band, by
 * RecruitmentNotificationOutboxWorker. Structurally identical to
 * {@code project.notification.domain.NotificationOutbox} — kept as a separate class/table so
 * recruitment notification volume and failures never mix with sales-lead notifications.
 */
@Entity
@Table(name = "job_application_notification_outbox")
public class RecruitmentNotificationOutbox {

    @Id
    private UUID id;

    @Column(name = "job_application_id", nullable = false)
    private UUID jobApplicationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 30)
    private RecruitmentNotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RecruitmentNotificationOutboxStatus status;

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

    protected RecruitmentNotificationOutbox() {
    }

    public RecruitmentNotificationOutbox(UUID jobApplicationId, RecruitmentNotificationType notificationType) {
        this.id = UUID.randomUUID();
        this.jobApplicationId = jobApplicationId;
        this.notificationType = notificationType;
        this.status = RecruitmentNotificationOutboxStatus.PENDING;
        this.attemptCount = 0;
        this.nextAttemptAt = Instant.now();
    }

    public void markProcessing() {
        this.status = RecruitmentNotificationOutboxStatus.PROCESSING;
        this.processingStartedAt = Instant.now();
        this.attemptCount += 1;
    }

    public void markSent() {
        this.status = RecruitmentNotificationOutboxStatus.SENT;
        this.sentAt = Instant.now();
        this.processingStartedAt = null;
        this.lastErrorCode = null;
        this.lastErrorSummary = null;
    }

    public void markRetry(Duration delay, String errorCode, String errorSummary) {
        this.status = RecruitmentNotificationOutboxStatus.RETRY;
        this.nextAttemptAt = Instant.now().plus(delay);
        this.processingStartedAt = null;
        this.lastErrorCode = errorCode;
        this.lastErrorSummary = errorSummary;
    }

    public void markFailed(String errorCode, String errorSummary) {
        this.status = RecruitmentNotificationOutboxStatus.FAILED;
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

    public UUID getJobApplicationId() {
        return jobApplicationId;
    }

    public RecruitmentNotificationType getNotificationType() {
        return notificationType;
    }

    public RecruitmentNotificationOutboxStatus getStatus() {
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
