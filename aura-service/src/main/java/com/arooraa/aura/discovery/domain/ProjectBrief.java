package com.arooraa.aura.discovery.domain;

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
 * One conversation's project brief.
 *
 * <p>Addressed only through its conversation — there is no public identifier for a brief, so one
 * conversation cannot name another's. The structured content is held as a JSON document rather
 * than as columns: nothing here is queried by field, and the shape belongs to the extractor that
 * produces it.
 *
 * <p>{@code consentedAt} and {@code submittedAt} are timestamps rather than booleans because both
 * are facts about something that happened, and "when" is the part anyone would want later.
 */
@Entity
@Table(name = "aura_project_briefs")
public class ProjectBrief {

    @Id
    private UUID id;

    @Column(name = "conversation_id", nullable = false, unique = true)
    private UUID conversationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private BriefStatus status;

    @Column(name = "fields_json", nullable = false, columnDefinition = "text")
    private String fieldsJson;

    @Column(name = "consented_at")
    private Instant consentedAt;

    @Column(name = "enquiry_reference", length = 64)
    private String enquiryReference;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected ProjectBrief() {
    }

    public static ProjectBrief draft(UUID conversationId, String fieldsJson) {
        ProjectBrief brief = new ProjectBrief();
        brief.id = UUID.randomUUID();
        brief.conversationId = conversationId;
        brief.status = BriefStatus.DRAFT;
        brief.fieldsJson = fieldsJson;
        return brief;
    }

    /**
     * Replaces the extracted content. Refuses to touch a brief that has already been handed over:
     * a submitted enquiry and the brief it was built from must keep saying the same thing.
     */
    public void replaceFields(String fieldsJson) {
        if (status == BriefStatus.SUBMITTED) {
            throw new IllegalStateException("A submitted brief cannot be re-extracted.");
        }
        this.fieldsJson = fieldsJson;
        this.status = BriefStatus.DRAFT;
    }

    /** Called when the summary is actually returned to the visitor, and only then. */
    public void markSummarised() {
        if (status == BriefStatus.DRAFT) {
            status = BriefStatus.SUMMARISED;
        }
    }

    public void markSubmitted(String enquiryReference, Instant consentedAt) {
        this.status = BriefStatus.SUBMITTED;
        this.enquiryReference = enquiryReference;
        this.consentedAt = consentedAt;
        this.submittedAt = Instant.now();
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

    public BriefStatus getStatus() {
        return status;
    }

    public String getFieldsJson() {
        return fieldsJson;
    }

    public Instant getConsentedAt() {
        return consentedAt;
    }

    public String getEnquiryReference() {
        return enquiryReference;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public boolean isSubmitted() {
        return status == BriefStatus.SUBMITTED;
    }
}
