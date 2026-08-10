package com.arooraa.leads.admin.leads.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** Append-only. No update/delete for the MVP — history is never silently overwritten. */
@Entity
@Table(name = "lead_notes")
public class LeadNote {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "lead_type", nullable = false, length = 20)
    private LeadType leadType;

    @Column(name = "lead_id", nullable = false)
    private UUID leadId;

    @Column(name = "admin_user_id", nullable = false)
    private UUID adminUserId;

    @Column(name = "note", nullable = false, length = 4000)
    private String note;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected LeadNote() {
    }

    public LeadNote(LeadType leadType, UUID leadId, UUID adminUserId, String note) {
        this.id = UUID.randomUUID();
        this.leadType = leadType;
        this.leadId = leadId;
        this.adminUserId = adminUserId;
        this.note = note;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
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

    public UUID getAdminUserId() {
        return adminUserId;
    }

    public String getNote() {
        return note;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
