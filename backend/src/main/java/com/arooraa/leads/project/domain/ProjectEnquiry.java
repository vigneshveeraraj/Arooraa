package com.arooraa.leads.project.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_enquiries")
public class ProjectEnquiry {

    @Id
    private UUID id;

    @Column(name = "enquiry_number", nullable = false, unique = true, length = 20)
    private String enquiryNumber;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false, length = 40)
    private ServiceType serviceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", nullable = false, length = 40)
    private ProjectType projectType;

    @Column(name = "description", nullable = false, length = 3000)
    private String description;

    @Column(name = "existing_system", nullable = false)
    private boolean existingSystem;

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_range", nullable = false, length = 30)
    private BudgetRange budgetRange;

    @Enumerated(EnumType.STRING)
    @Column(name = "timeline", nullable = false, length = 30)
    private Timeline timeline;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_contact_method", nullable = false, length = 20)
    private PreferredContactMethod preferredContactMethod;

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

    protected ProjectEnquiry() {
    }

    public ProjectEnquiry(String enquiryNumber, String name, String companyName, String businessEmail,
                           String phone, String normalizedPhone, String country, ServiceType serviceType,
                           ProjectType projectType, String description, boolean existingSystem,
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

    public ServiceType getServiceType() {
        return serviceType;
    }

    public ProjectType getProjectType() {
        return projectType;
    }

    public String getDescription() {
        return description;
    }

    public boolean isExistingSystem() {
        return existingSystem;
    }

    public BudgetRange getBudgetRange() {
        return budgetRange;
    }

    public Timeline getTimeline() {
        return timeline;
    }

    public PreferredContactMethod getPreferredContactMethod() {
        return preferredContactMethod;
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

    public EnquiryStatus getStatus() {
        return status;
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
}
