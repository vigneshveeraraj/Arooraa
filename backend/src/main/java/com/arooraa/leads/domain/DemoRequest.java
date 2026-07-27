package com.arooraa.leads.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "demo_requests")
public class DemoRequest {

    @Id
    private UUID id;

    @Column(name = "contact_name", nullable = false, length = 100)
    private String contactName;

    @Column(name = "restaurant_name", nullable = false, length = 150)
    private String restaurantName;

    @Column(name = "normalized_whatsapp_number", nullable = false, length = 20)
    private String normalizedWhatsappNumber;

    @Column(name = "business_email", length = 254)
    private String businessEmail;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(name = "outlet_count", nullable = false, length = 20)
    private OutletCount outletCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "restaurant_type", nullable = false, length = 30)
    private RestaurantType restaurantType;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_challenge", nullable = false, length = 30)
    private PrimaryChallenge primaryChallenge;

    @Column(name = "current_software", length = 150)
    private String currentSoftware;

    @Column(name = "preferred_demo_date")
    private LocalDate preferredDemoDate;

    @Column(name = "preferred_demo_time", length = 50)
    private String preferredDemoTime;

    @Column(name = "additional_message", length = 2000)
    private String additionalMessage;

    @Column(name = "source_page", length = 500)
    private String sourcePage;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LeadStatus status;

    @Column(name = "ip_hash", nullable = false, length = 64)
    private String ipHash;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "referrer", length = 1000)
    private String referrer;

    @Column(name = "utm_source", length = 200)
    private String utmSource;

    @Column(name = "utm_medium", length = 200)
    private String utmMedium;

    @Column(name = "utm_campaign", length = 200)
    private String utmCampaign;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_status", nullable = false, length = 20)
    private NotificationStatus notificationStatus;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected DemoRequest() {
    }

    public DemoRequest(String contactName, String restaurantName, String normalizedWhatsappNumber,
                       String businessEmail, String city, OutletCount outletCount, RestaurantType restaurantType,
                       PrimaryChallenge primaryChallenge, String currentSoftware, LocalDate preferredDemoDate,
                       String preferredDemoTime, String additionalMessage, String sourcePage, String ipHash,
                       String userAgent, String referrer, String utmSource, String utmMedium, String utmCampaign) {
        this.id = UUID.randomUUID();
        this.contactName = contactName;
        this.restaurantName = restaurantName;
        this.normalizedWhatsappNumber = normalizedWhatsappNumber;
        this.businessEmail = businessEmail;
        this.city = city;
        this.outletCount = outletCount;
        this.restaurantType = restaurantType;
        this.primaryChallenge = primaryChallenge;
        this.currentSoftware = currentSoftware;
        this.preferredDemoDate = preferredDemoDate;
        this.preferredDemoTime = preferredDemoTime;
        this.additionalMessage = additionalMessage;
        this.sourcePage = sourcePage;
        this.status = LeadStatus.NEW;
        this.ipHash = ipHash;
        this.userAgent = userAgent;
        this.referrer = referrer;
        this.utmSource = utmSource;
        this.utmMedium = utmMedium;
        this.utmCampaign = utmCampaign;
        this.notificationStatus = NotificationStatus.PENDING;
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

    public String getContactName() {
        return contactName;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public String getNormalizedWhatsappNumber() {
        return normalizedWhatsappNumber;
    }

    public String getBusinessEmail() {
        return businessEmail;
    }

    public String getCity() {
        return city;
    }

    public OutletCount getOutletCount() {
        return outletCount;
    }

    public RestaurantType getRestaurantType() {
        return restaurantType;
    }

    public PrimaryChallenge getPrimaryChallenge() {
        return primaryChallenge;
    }

    public String getCurrentSoftware() {
        return currentSoftware;
    }

    public LocalDate getPreferredDemoDate() {
        return preferredDemoDate;
    }

    public String getPreferredDemoTime() {
        return preferredDemoTime;
    }

    public String getAdditionalMessage() {
        return additionalMessage;
    }

    public String getSourcePage() {
        return sourcePage;
    }

    public LeadStatus getStatus() {
        return status;
    }

    public String getIpHash() {
        return ipHash;
    }

    public String getUserAgent() {
        return userAgent;
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

    public NotificationStatus getNotificationStatus() {
        return notificationStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
