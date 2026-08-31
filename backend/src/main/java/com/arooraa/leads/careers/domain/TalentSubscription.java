package com.arooraa.leads.careers.domain;

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

/**
 * A talent-community / job-alert subscription (W3.3B §11) — a distinct recruitment-marketing
 * purpose from {@link JobApplication}, with its own separate consent (W3.3B §13: application
 * consent and talent-community consent are separate purposes; an application never implicitly
 * subscribes anyone). One row per email — a second submission from the same address updates
 * this row (see the unique constraint and TalentSubscriptionService) rather than creating a
 * duplicate.
 */
@Entity
@Table(name = "talent_subscriptions")
public class TalentSubscription {

    @Id
    private UUID id;

    @Column(name = "email", nullable = false, unique = true, length = 254)
    private String email;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "talent_subscription_areas", joinColumns = @JoinColumn(name = "talent_subscription_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "area_of_interest", length = 30)
    private Set<AreaOfInterest> areasOfInterest = new LinkedHashSet<>();

    @Column(name = "experience_level", length = 40)
    private String experienceLevel;

    @Column(name = "consent_accepted", nullable = false)
    private boolean consentAccepted;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SubscriptionStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected TalentSubscription() {
    }

    public TalentSubscription(String email, String name, Set<AreaOfInterest> areasOfInterest,
                               String experienceLevel, boolean consentAccepted) {
        this.id = UUID.randomUUID();
        this.email = email;
        this.name = name;
        this.areasOfInterest = new LinkedHashSet<>(areasOfInterest);
        this.experienceLevel = experienceLevel;
        this.consentAccepted = consentAccepted;
        this.status = SubscriptionStatus.ACTIVE;
    }

    /** Re-submission from the same email (W3.3B §12) — refresh interests/consent, never duplicate the row. */
    public void refresh(String name, Set<AreaOfInterest> areasOfInterest, String experienceLevel, boolean consentAccepted) {
        this.name = name;
        this.areasOfInterest = new LinkedHashSet<>(areasOfInterest);
        this.experienceLevel = experienceLevel;
        this.consentAccepted = consentAccepted;
        this.status = SubscriptionStatus.ACTIVE;
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

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public Set<AreaOfInterest> getAreasOfInterest() {
        return areasOfInterest;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public boolean isConsentAccepted() {
        return consentAccepted;
    }

    public SubscriptionStatus getStatus() {
        return status;
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
