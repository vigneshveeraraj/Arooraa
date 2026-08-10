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

/**
 * Immutable audit trail. Deliberately stores only short before/after value strings
 * (e.g. status names, ISO timestamps, admin names) — never note content, never full
 * entity snapshots, never secrets.
 */
@Entity
@Table(name = "lead_activity")
public class LeadActivity {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "lead_type", nullable = false, length = 20)
    private LeadType leadType;

    @Column(name = "lead_id", nullable = false)
    private UUID leadId;

    @Column(name = "actor_admin_id")
    private UUID actorAdminId;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 30)
    private ActivityType activityType;

    @Column(name = "old_value", length = 200)
    private String oldValue;

    @Column(name = "new_value", length = 200)
    private String newValue;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected LeadActivity() {
    }

    public LeadActivity(LeadType leadType, UUID leadId, UUID actorAdminId, ActivityType activityType,
                         String oldValue, String newValue) {
        this.id = UUID.randomUUID();
        this.leadType = leadType;
        this.leadId = leadId;
        this.actorAdminId = actorAdminId;
        this.activityType = activityType;
        this.oldValue = oldValue;
        this.newValue = newValue;
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

    public UUID getActorAdminId() {
        return actorAdminId;
    }

    public ActivityType getActivityType() {
        return activityType;
    }

    public String getOldValue() {
        return oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
