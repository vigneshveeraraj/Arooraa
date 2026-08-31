package com.arooraa.leads.careers.domain;

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
 * One candidate application to one AROORAA role (W3.3B §2). Deliberately its own table, never
 * a row in project_enquiries or the MESA demo-request tables — a job application is not a
 * sales lead. {@code jobTitleSnapshot} is copied at submission time rather than re-derived from
 * the frontend's job dataset, so this record stays meaningful even if that content changes
 * later. Résumé bytes are never stored here — only metadata describing where
 * {@link com.arooraa.leads.careers.storage.ResumeStorage} put them (résumé is optional, per the
 * already-approved W3.3A frontend contract).
 */
@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    private UUID id;

    @Column(name = "application_reference", nullable = false, unique = true, length = 20)
    private String applicationReference;

    @Column(name = "job_slug", nullable = false, length = 60)
    private String jobSlug;

    @Column(name = "job_title_snapshot", nullable = false, length = 150)
    private String jobTitleSnapshot;

    @Column(name = "candidate_name", nullable = false, length = 100)
    private String candidateName;

    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @Column(name = "phone", nullable = false, length = 30)
    private String phone;

    @Column(name = "current_location", length = 150)
    private String currentLocation;

    @Column(name = "experience", length = 100)
    private String experience;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;

    @Column(name = "note", length = 2000)
    private String note;

    @Column(name = "resume_storage_key", length = 150)
    private String resumeStorageKey;

    @Column(name = "resume_original_filename", length = 255)
    private String resumeOriginalFilename;

    @Column(name = "resume_content_type", length = 100)
    private String resumeContentType;

    @Column(name = "resume_size")
    private Long resumeSize;

    @Column(name = "consent_accepted", nullable = false)
    private boolean consentAccepted;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Column(name = "request_fingerprint", length = 64)
    private String requestFingerprint;

    @Column(name = "ip_hash", nullable = false, length = 64)
    private String ipHash;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected JobApplication() {
    }

    public JobApplication(String applicationReference, String jobSlug, String jobTitleSnapshot,
                           String candidateName, String email, String phone, String currentLocation,
                           String experience, String linkedinUrl, String portfolioUrl, String note,
                           boolean consentAccepted, String ipHash) {
        this.id = UUID.randomUUID();
        this.applicationReference = applicationReference;
        this.jobSlug = jobSlug;
        this.jobTitleSnapshot = jobTitleSnapshot;
        this.candidateName = candidateName;
        this.email = email;
        this.phone = phone;
        this.currentLocation = currentLocation;
        this.experience = experience;
        this.linkedinUrl = linkedinUrl;
        this.portfolioUrl = portfolioUrl;
        this.note = note;
        this.consentAccepted = consentAccepted;
        this.status = ApplicationStatus.RECEIVED;
        this.ipHash = ipHash;
    }

    /** Set only when a résumé was actually attached — all four fields together, or none. */
    public void attachResume(String storageKey, String originalFilename, String contentType, long size) {
        this.resumeStorageKey = storageKey;
        this.resumeOriginalFilename = originalFilename;
        this.resumeContentType = contentType;
        this.resumeSize = size;
    }

    public void applyIdempotency(String idempotencyKey, String requestFingerprint) {
        this.idempotencyKey = idempotencyKey;
        this.requestFingerprint = requestFingerprint;
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

    public String getApplicationReference() {
        return applicationReference;
    }

    public String getJobSlug() {
        return jobSlug;
    }

    public String getJobTitleSnapshot() {
        return jobTitleSnapshot;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public String getExperience() {
        return experience;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public String getNote() {
        return note;
    }

    public String getResumeStorageKey() {
        return resumeStorageKey;
    }

    public String getResumeOriginalFilename() {
        return resumeOriginalFilename;
    }

    public String getResumeContentType() {
        return resumeContentType;
    }

    public Long getResumeSize() {
        return resumeSize;
    }

    public boolean isConsentAccepted() {
        return consentAccepted;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public String getRequestFingerprint() {
        return requestFingerprint;
    }

    public String getIpHash() {
        return ipHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public long getVersion() {
        return version;
    }
}
