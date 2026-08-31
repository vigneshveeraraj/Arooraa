package com.arooraa.leads.contact.domain;

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
 * One general contact message (W3.4 §9) — the general "I need to contact AROORAA about
 * something else" channel, distinct in purpose and storage from a sales lead
 * ({@code ProjectEnquiry}/{@code DemoRequest}), a recruitment application
 * ({@code JobApplication}), or a talent-community subscription ({@code TalentSubscription}).
 */
@Entity
@Table(name = "contact_messages")
public class ContactMessage {

    @Id
    private UUID id;

    @Column(name = "contact_reference", nullable = false, unique = true, length = 20)
    private String contactReference;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "company", length = 150)
    private String company;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 30)
    private ContactReason reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "product", length = 30)
    private ContactProduct product;

    @Column(name = "message", nullable = false, length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ContactMessageStatus status;

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

    protected ContactMessage() {
    }

    public ContactMessage(String contactReference, String name, String email, String phone, String company,
                           ContactReason reason, ContactProduct product, String message, String ipHash) {
        this.id = UUID.randomUUID();
        this.contactReference = contactReference;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.company = company;
        this.reason = reason;
        this.product = product;
        this.message = message;
        this.status = ContactMessageStatus.NEW;
        this.ipHash = ipHash;
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

    public String getContactReference() {
        return contactReference;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getCompany() {
        return company;
    }

    public ContactReason getReason() {
        return reason;
    }

    public ContactProduct getProduct() {
        return product;
    }

    public String getMessage() {
        return message;
    }

    public ContactMessageStatus getStatus() {
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
