package com.arooraa.aura.knowledge.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.UUID;

/**
 * One versioned revision of an {@link AuraDocument}'s content — the actual unit of approval,
 * status and retrieval eligibility. A new edit is a new row, never an in-place update, so every
 * previously-approved version stays auditable (frozen product definition requirement).
 *
 * <p>Retrieval eligibility (enforced in {@code AuraDocumentVersionRepository}, not only by
 * prompting) requires ALL of: {@code active = true}, {@code visibility = PUBLIC},
 * {@code status = INDEXED}.
 */
@Entity
@Table(name = "aura_document_versions")
public class AuraDocumentVersion {

    @Id
    private UUID id;

    @Column(name = "document_id", nullable = false)
    private UUID documentId;

    /** Monotonically increasing per document, starting at 1 — assigned by the service layer. */
    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DocumentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 20)
    private Visibility visibility;

    /** Only meaningful for a document describing a product/service capability; null otherwise. */
    @Enumerated(EnumType.STRING)
    @Column(name = "product_status", length = 20)
    private ProductStatus productStatus;

    /** True for exactly one version per document — the one retrieval/editorial tooling reads. Enforced by a partial unique index (V1). */
    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(name = "effective_from")
    private Instant effectiveFrom;

    /** The approved editorial content this version's chunks are derived from — plain text/markdown, never generated directly from unreviewed material. */
    @Column(name = "raw_content", nullable = false, columnDefinition = "text")
    private String rawContent;

    /** Free-text approver identity (name/email) — deliberately not a foreign key: this service has no user/tenant/auth model, and none is being introduced for this alone. */
    @Column(name = "approved_by", length = 200)
    private String approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Version
    @Column(name = "version", nullable = false)
    private long optimisticVersion;

    protected AuraDocumentVersion() {
    }

    public AuraDocumentVersion(UUID documentId, int versionNumber, Visibility visibility,
                                ProductStatus productStatus, String sourceUrl, String rawContent) {
        this.id = UUID.randomUUID();
        this.documentId = documentId;
        this.versionNumber = versionNumber;
        this.status = DocumentStatus.DRAFT;
        this.visibility = visibility;
        this.productStatus = productStatus;
        this.sourceUrl = sourceUrl;
        this.rawContent = rawContent;
        this.active = false;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public void submitForReview() {
        this.status = DocumentStatus.IN_REVIEW;
    }

    public void approve(String approvedBy) {
        this.status = DocumentStatus.APPROVED;
        this.approvedBy = approvedBy;
        this.approvedAt = Instant.now();
        this.effectiveFrom = this.effectiveFrom != null ? this.effectiveFrom : this.approvedAt;
    }

    /** Marks this version as successfully chunked and embedded — the only status eligible for retrieval. */
    public void markIndexed() {
        this.status = DocumentStatus.INDEXED;
    }

    public void archive() {
        this.status = DocumentStatus.ARCHIVED;
        this.active = false;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    public UUID getId() {
        return id;
    }

    public UUID getDocumentId() {
        return documentId;
    }

    public int getVersionNumber() {
        return versionNumber;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public Visibility getVisibility() {
        return visibility;
    }

    public ProductStatus getProductStatus() {
        return productStatus;
    }

    public boolean isActive() {
        return active;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public Instant getEffectiveFrom() {
        return effectiveFrom;
    }

    public String getRawContent() {
        return rawContent;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
