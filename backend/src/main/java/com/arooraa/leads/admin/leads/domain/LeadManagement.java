package com.arooraa.leads.admin.leads.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Internal CRM overlay for a lead in either domain table, one row per (lead_type,
 * lead_id). Deliberately does not duplicate the lead's own status — that stays on
 * demo_requests/project_enquiries as the single source of truth. This table only holds
 * metadata neither public table has: assignment, follow-up, commercial estimate, and why
 * a lead was lost.
 */
@Entity
@Table(name = "lead_management")
public class LeadManagement {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "lead_type", nullable = false, length = 20)
    private LeadType leadType;

    @Column(name = "lead_id", nullable = false)
    private UUID leadId;

    @Column(name = "assigned_admin_id")
    private UUID assignedAdminId;

    @Column(name = "follow_up_at")
    private Instant followUpAt;

    @Column(name = "estimated_value", precision = 14, scale = 2)
    private BigDecimal estimatedValue;

    @Column(name = "estimated_value_currency", length = 3)
    private String estimatedValueCurrency;

    @Enumerated(EnumType.STRING)
    @Column(name = "lost_reason", length = 30)
    private LostReason lostReason;

    @Column(name = "internal_summary", length = 2000)
    private String internalSummary;

    @Column(name = "last_contacted_at")
    private Instant lastContactedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected LeadManagement() {
    }

    public LeadManagement(LeadType leadType, UUID leadId) {
        this.id = UUID.randomUUID();
        this.leadType = leadType;
        this.leadId = leadId;
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

    public void assignTo(UUID adminId) {
        this.assignedAdminId = adminId;
    }

    public void setFollowUpAt(Instant followUpAt) {
        this.followUpAt = followUpAt;
    }

    public void setEstimatedValue(BigDecimal estimatedValue, String currency) {
        this.estimatedValue = estimatedValue;
        this.estimatedValueCurrency = estimatedValue == null ? null : currency;
    }

    public void setLostReason(LostReason lostReason) {
        this.lostReason = lostReason;
    }

    public void setInternalSummary(String internalSummary) {
        this.internalSummary = internalSummary;
    }

    public void touchLastContacted(Instant at) {
        this.lastContactedAt = at;
    }

    public UUID getId() {
        return id;
    }

    public LeadType getLeadType() {
        return leadType;
    }

    public UUID getLeadId() {
        return leadId;
    }

    public UUID getAssignedAdminId() {
        return assignedAdminId;
    }

    public Instant getFollowUpAt() {
        return followUpAt;
    }

    public BigDecimal getEstimatedValue() {
        return estimatedValue;
    }

    public String getEstimatedValueCurrency() {
        return estimatedValueCurrency;
    }

    public LostReason getLostReason() {
        return lostReason;
    }

    public String getInternalSummary() {
        return internalSummary;
    }

    public Instant getLastContactedAt() {
        return lastContactedAt;
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
