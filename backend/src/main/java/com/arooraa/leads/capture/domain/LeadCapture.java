package com.arooraa.leads.capture.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
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
 * One low-friction lead (frontend-v2/docs/lead-capture.md): what the customer needs, a phone
 * number and recorded consent — deliberately no name or email. Created either by the website's
 * consultation form or by a customer messaging AROORAA first; the scripted conversation then
 * fills in language, business type and a call time, one question at a time.
 */
@Entity
@Table(name = "lead_captures")
public class LeadCapture {

    @Id
    private UUID id;

    @Column(name = "lead_reference", nullable = false, unique = true, length = 12)
    private String leadReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "requirement", length = 30)
    private LeadRequirement requirement;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "country_code", length = 2)
    private String countryCode;

    @Column(name = "consent_given", nullable = false)
    private boolean consentGiven;

    @Column(name = "consent_text", nullable = false, length = 500)
    private String consentText;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_source", nullable = false, length = 30)
    private ConsentSource consentSource;

    @Column(name = "consent_at", nullable = false)
    private Instant consentAt;

    @Convert(converter = LeadLanguageConverter.class)
    @Column(name = "source_locale", length = 5)
    private LeadLanguage sourceLocale;

    @Convert(converter = LeadLanguageConverter.class)
    @Column(name = "preferred_language", length = 5)
    private LeadLanguage preferredLanguage;

    @Column(name = "business_type", length = 150)
    private String businessType;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_call_time", length = 20)
    private PreferredCallTime preferredCallTime;

    @Column(name = "handoff_requested", nullable = false)
    private boolean handoffRequested;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 20)
    private LeadSource source;

    @Column(name = "source_page", length = 500)
    private String sourcePage;

    @Column(name = "referrer", length = 500)
    private String referrer;

    @Column(name = "utm_source", length = 100)
    private String utmSource;

    @Column(name = "utm_medium", length = 100)
    private String utmMedium;

    @Column(name = "utm_campaign", length = 100)
    private String utmCampaign;

    @Column(name = "utm_content", length = 100)
    private String utmContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LeadCaptureStatus status;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Column(name = "request_fingerprint", length = 64)
    private String requestFingerprint;

    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected LeadCapture() {
    }

    private LeadCapture(String leadReference, String phone, String countryCode, String consentText,
                        ConsentSource consentSource, LeadSource source) {
        this.id = UUID.randomUUID();
        this.leadReference = leadReference;
        this.phone = phone;
        this.countryCode = countryCode;
        this.consentGiven = true;
        this.consentText = consentText;
        this.consentSource = consentSource;
        this.consentAt = Instant.now();
        this.source = source;
        this.status = LeadCaptureStatus.NEW;
    }

    /** The website form. {@code phone} must already be normalised to +91XXXXXXXXXX. */
    public static LeadCapture fromWebForm(String leadReference, LeadRequirement requirement, String phone,
                                          String consentText, LeadLanguage sourceLocale, Attribution attribution,
                                          String ipHash) {
        LeadCapture lead = new LeadCapture(leadReference, phone, "IN", consentText, ConsentSource.WEB_FORM,
                LeadSource.WEBSITE);
        lead.requirement = requirement;
        lead.sourceLocale = sourceLocale;
        lead.sourcePage = attribution.sourcePage();
        lead.referrer = attribution.referrer();
        lead.utmSource = attribution.utmSource();
        lead.utmMedium = attribution.utmMedium();
        lead.utmCampaign = attribution.utmCampaign();
        lead.utmContent = attribution.utmContent();
        lead.ipHash = ipHash;
        return lead;
    }

    /** A customer who messaged first, with no saved lead of their own to attach to. */
    public static LeadCapture fromConversation(String leadReference, String phone, String countryCode,
                                               String consentText, LeadSource source) {
        return new LeadCapture(leadReference, phone, countryCode, consentText,
                ConsentSource.CUSTOMER_INITIATED_CHAT, source);
    }

    public record Attribution(String sourcePage, String referrer, String utmSource, String utmMedium,
                              String utmCampaign, String utmContent) {
    }

    public void applyIdempotency(String idempotencyKey, String requestFingerprint) {
        this.idempotencyKey = idempotencyKey;
        this.requestFingerprint = requestFingerprint;
    }

    /** The customer's own choice; overrides {@code sourceLocale} for all follow-up. */
    public void choosePreferredLanguage(LeadLanguage language) {
        this.preferredLanguage = language;
    }

    public void answerRequirement(LeadRequirement requirement) {
        this.requirement = requirement;
    }

    public void answerBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public void answerPreferredCallTime(PreferredCallTime preferredCallTime) {
        this.preferredCallTime = preferredCallTime;
    }

    public void requestHandoff() {
        this.handoffRequested = true;
    }

    public void updateStatus(LeadCaptureStatus status) {
        this.status = status;
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

    public String getLeadReference() {
        return leadReference;
    }

    public LeadRequirement getRequirement() {
        return requirement;
    }

    public String getPhone() {
        return phone;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public boolean isConsentGiven() {
        return consentGiven;
    }

    public String getConsentText() {
        return consentText;
    }

    public ConsentSource getConsentSource() {
        return consentSource;
    }

    public Instant getConsentAt() {
        return consentAt;
    }

    public LeadLanguage getSourceLocale() {
        return sourceLocale;
    }

    public LeadLanguage getPreferredLanguage() {
        return preferredLanguage;
    }

    public String getBusinessType() {
        return businessType;
    }

    public PreferredCallTime getPreferredCallTime() {
        return preferredCallTime;
    }

    public boolean isHandoffRequested() {
        return handoffRequested;
    }

    public LeadSource getSource() {
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

    public LeadCaptureStatus getStatus() {
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
