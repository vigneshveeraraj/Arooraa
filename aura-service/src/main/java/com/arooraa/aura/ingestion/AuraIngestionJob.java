package com.arooraa.aura.ingestion;

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
 * Tracks one chunk+embed run for a single {@code AuraDocumentVersion}. Kept minimal by design —
 * this milestone proves the pipeline exists and is auditable, not a production job-queue system.
 * {@code errorMessage} is a short, safe summary only (security baseline: no raw prompt or stack
 * trace logging/persistence by default).
 */
@Entity
@Table(name = "aura_ingestion_jobs")
public class AuraIngestionJob {

    @Id
    private UUID id;

    @Column(name = "document_version_id", nullable = false)
    private UUID documentVersionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private IngestionJobStatus status;

    @Column(name = "chunk_count")
    private Integer chunkCount;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    protected AuraIngestionJob() {
    }

    public AuraIngestionJob(UUID documentVersionId) {
        this.id = UUID.randomUUID();
        this.documentVersionId = documentVersionId;
        this.status = IngestionJobStatus.PENDING;
    }

    @PrePersist
    void onCreate() {
        this.startedAt = Instant.now();
    }

    public void markRunning() {
        this.status = IngestionJobStatus.RUNNING;
    }

    public void markSucceeded(int chunkCount) {
        this.status = IngestionJobStatus.SUCCEEDED;
        this.chunkCount = chunkCount;
        this.completedAt = Instant.now();
    }

    public void markFailed(String errorMessage) {
        this.status = IngestionJobStatus.FAILED;
        this.errorMessage = errorMessage;
        this.completedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getDocumentVersionId() {
        return documentVersionId;
    }

    public IngestionJobStatus getStatus() {
        return status;
    }

    public Integer getChunkCount() {
        return chunkCount;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
