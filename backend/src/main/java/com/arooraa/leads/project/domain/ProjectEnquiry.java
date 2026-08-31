package com.arooraa.leads.project.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "project_enquiries")
public class ProjectEnquiry {

    @Id
    private UUID id;

    @Column(name = "enquiry_number", nullable = false, unique = true, length = 20)
    private String enquiryNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "submission_version", nullable = false, length = 10)
    private SubmissionVersion submissionVersion = SubmissionVersion.LEGACY;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "company_name", length = 150)
    private String companyName;

    @Column(name = "business_email", nullable = false, length = 254)
    private String businessEmail;

    @Column(name = "phone", nullable = false, length = 30)
    private String phone;

    @Column(name = "normalized_phone", nullable = false, length = 20)
    private String normalizedPhone;

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    /** ISO 3166-1 alpha-2 (e.g. "IN") — guided flow only; legacy rows leave this null (W3.2B §13). */
    @Column(name = "country_code", length = 4)
    private String countryCode;

    /** Guided flow only. */
    @Column(name = "role", length = 100)
    private String role;

    // --- Legacy-only fields (nullable so guided rows can leave them unset; LEGACY submissions
    // still require them, enforced in ProjectEnquiryCreateRequest/ProjectEnquiryService). ---

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", length = 40)
    private ServiceType serviceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", length = 40)
    private ProjectType projectType;

    @Column(name = "description", length = 3000)
    private String description;

    @Column(name = "existing_system")
    private Boolean existingSystem;

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_range", length = 30)
    private BudgetRange budgetRange;

    @Enumerated(EnumType.STRING)
    @Column(name = "timeline", length = 30)
    private Timeline timeline;

    // --- Guided-only fields (nullable; legacy rows leave these unset). ---

    @Enumerated(EnumType.STRING)
    @Column(name = "solution_model", length = 40)
    private SolutionModel solutionModel;

    @Enumerated(EnumType.STRING)
    @Column(name = "engagement_model", length = 40)
    private EngagementModel engagementModel;

    @Column(name = "problem_statement", length = 3000)
    private String problemStatement;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_stage", length = 40)
    private ProjectStage projectStage;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_enquiry_product_types", joinColumns = @JoinColumn(name = "enquiry_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", length = 60)
    private Set<ProductType> productTypes = new LinkedHashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "guided_timeline", length = 30)
    private GuidedTimeline guidedTimeline;

    @Enumerated(EnumType.STRING)
    @Column(name = "guided_budget_range", length = 30)
    private GuidedBudgetRange guidedBudgetRange;

    @Column(name = "existing_system_context", length = 3000)
    private String existingSystemContext;

    // --- Shared contact/preference fields. ---

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_contact_method", nullable = false, length = 20)
    private PreferredContactMethod preferredContactMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_contact_time", length = 20)
    private PreferredContactTime preferredContactTime;

    @Column(name = "whatsapp_consent", nullable = false)
    private boolean whatsappConsent = false;

    @Column(name = "whatsapp_consent_at")
    private Instant whatsappConsentAt;

    // --- Attribution. ---

    @Column(name = "source", length = 50)
    private String source;

    @Column(name = "source_page", length = 500)
    private String sourcePage;

    @Column(name = "referrer", length = 1000)
    private String referrer;

    @Column(name = "utm_source", length = 200)
    private String utmSource;

    @Column(name = "utm_medium", length = 200)
    private String utmMedium;

    @Column(name = "utm_campaign", length = 200)
    private String utmCampaign;

    @Column(name = "utm_content", length = 200)
    private String utmContent;

    @Column(name = "source_context", length = 60)
    private String sourceContext;

    @Column(name = "entry_route", length = 500)
    private String entryRoute;

    // --- Idempotency (W3.2B §23-24) — distinct from the legacy time-window duplicate check. ---

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Column(name = "request_fingerprint", length = 64)
    private String requestFingerprint;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EnquiryStatus status;

    @Column(name = "ip_hash", nullable = false, length = 64)
    private String ipHash;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected ProjectEnquiry() {
    }

    public ProjectEnquiry(String enquiryNumber, String name, String companyName, String businessEmail,
                           String phone, String normalizedPhone, String country, ServiceType serviceType,
                           ProjectType projectType, String description, Boolean existingSystem,
                           BudgetRange budgetRange, Timeline timeline, PreferredContactMethod preferredContactMethod,
                           String source, String sourcePage, String ipHash, String userAgent, String referrer,
                           String utmSource, String utmMedium, String utmCampaign) {
        this.id = UUID.randomUUID();
        this.enquiryNumber = enquiryNumber;
        this.name = name;
        this.companyName = companyName;
        this.businessEmail = businessEmail;
        this.phone = phone;
        this.normalizedPhone = normalizedPhone;
        this.country = country;
        this.serviceType = serviceType;
        this.projectType = projectType;
        this.description = description;
        this.existingSystem = existingSystem;
        this.budgetRange = budgetRange;
        this.timeline = timeline;
        this.preferredContactMethod = preferredContactMethod;
        this.source = source;
        this.sourcePage = sourcePage;
        this.status = EnquiryStatus.NEW;
        this.ipHash = ipHash;
        this.userAgent = userAgent;
        this.referrer = referrer;
        this.utmSource = utmSource;
        this.utmMedium = utmMedium;
        this.utmCampaign = utmCampaign;
    }

    /**
     * Fills the guided-flow-only fields and marks this row GUIDED. Kept as a post-construction
     * mutator rather than a second constructor overload so the original 22-arg constructor
     * (and every existing caller/test built against it) stays untouched (W3.2B).
     */
    public void applyGuidedFields(SolutionModel solutionModel, EngagementModel engagementModel,
                                   String problemStatement, ProjectStage projectStage, Set<ProductType> productTypes,
                                   GuidedTimeline guidedTimeline, GuidedBudgetRange guidedBudgetRange,
                                   String existingSystemContext, String role, String countryCode,
                                   PreferredContactTime preferredContactTime, boolean whatsappConsent,
                                   String sourceContext, String entryRoute, String utmContent) {
        this.submissionVersion = SubmissionVersion.GUIDED;
        this.solutionModel = solutionModel;
        this.engagementModel = engagementModel;
        this.problemStatement = problemStatement;
        this.projectStage = projectStage;
        this.productTypes = productTypes == null ? new LinkedHashSet<>() : new LinkedHashSet<>(productTypes);
        this.guidedTimeline = guidedTimeline;
        this.guidedBudgetRange = guidedBudgetRange;
        this.existingSystemContext = existingSystemContext;
        this.role = role;
        this.countryCode = countryCode;
        this.preferredContactTime = preferredContactTime;
        this.whatsappConsent = whatsappConsent;
        this.whatsappConsentAt = whatsappConsent ? Instant.now() : null;
        this.sourceContext = sourceContext;
        this.entryRoute = entryRoute;
        this.utmContent = utmContent;
    }

    /** Tags this row with the idempotency key it was created under, for future replay lookups. */
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

    public String getEnquiryNumber() {
        return enquiryNumber;
    }

    public SubmissionVersion getSubmissionVersion() {
        return submissionVersion;
    }

    public String getName() {
        return name;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getBusinessEmail() {
        return businessEmail;
    }

    public String getPhone() {
        return phone;
    }

    public String getNormalizedPhone() {
        return normalizedPhone;
    }

    public String getCountry() {
        return country;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public String getRole() {
        return role;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public ProjectType getProjectType() {
        return projectType;
    }

    public String getDescription() {
        return description;
    }

    public Boolean getExistingSystem() {
        return existingSystem;
    }

    public BudgetRange getBudgetRange() {
        return budgetRange;
    }

    public Timeline getTimeline() {
        return timeline;
    }

    public SolutionModel getSolutionModel() {
        return solutionModel;
    }

    public EngagementModel getEngagementModel() {
        return engagementModel;
    }

    public String getProblemStatement() {
        return problemStatement;
    }

    public ProjectStage getProjectStage() {
        return projectStage;
    }

    public Set<ProductType> getProductTypes() {
        return productTypes;
    }

    public GuidedTimeline getGuidedTimeline() {
        return guidedTimeline;
    }

    public GuidedBudgetRange getGuidedBudgetRange() {
        return guidedBudgetRange;
    }

    public String getExistingSystemContext() {
        return existingSystemContext;
    }

    public PreferredContactMethod getPreferredContactMethod() {
        return preferredContactMethod;
    }

    public PreferredContactTime getPreferredContactTime() {
        return preferredContactTime;
    }

    public boolean isWhatsappConsent() {
        return whatsappConsent;
    }

    public Instant getWhatsappConsentAt() {
        return whatsappConsentAt;
    }

    public String getSource() {
        return source;
    }

    public String getSourcePage() {
        return sourcePage;
    }

    public String getReferrer() {
        return referrer;
    }

    public String getUtmSource() {
        return utmSource;
    }

    public String getUtmMedium() {
        return utmMedium;
    }

    public String getUtmCampaign() {
        return utmCampaign;
    }

    public String getUtmContent() {
        return utmContent;
    }

    public String getSourceContext() {
        return sourceContext;
    }

    public String getEntryRoute() {
        return entryRoute;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public String getRequestFingerprint() {
        return requestFingerprint;
    }

    public EnquiryStatus getStatus() {
        return status;
    }

    /** Admin-only mutation (Milestone 2C). Public submission always starts at NEW. */
    public void updateStatus(EnquiryStatus newStatus) {
        this.status = newStatus;
    }

    public String getIpHash() {
        return ipHash;
    }

    public String getUserAgent() {
        return userAgent;
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
