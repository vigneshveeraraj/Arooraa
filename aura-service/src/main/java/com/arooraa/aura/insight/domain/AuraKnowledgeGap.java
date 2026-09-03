package com.arooraa.aura.insight.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.UUID;

/**
 * A question about AROORAA that our own approved knowledge could not answer.
 *
 * <p>Aggregated rather than logged. The fingerprint is a hash of the normalised question and the
 * assistant profile, and it is unique — so the same question asked forty times is one row with a
 * count of forty, rather than forty rows nobody notices. "What forty people wanted to know and we
 * could not tell them" is the single most useful thing this service could produce for the people
 * who write its knowledge, and it is only useful if it is one line.
 *
 * <p>Nothing here becomes knowledge on its own. There is no path from this table into the ingestion
 * pipeline — a gap is a note for a person, and approving what Aura may say stays a human act.
 */
@Entity
@Table(name = "aura_knowledge_gaps")
public class AuraKnowledgeGap {

    @Id
    private UUID id;

    @Column(name = "fingerprint", nullable = false, unique = true, length = 64)
    private String fingerprint;

    /**
     * The normalised question. Kept readable because a gap nobody can read is a gap nobody can
     * fill — and it is not a new exposure: the same words are already in the transcript, whose
     * deletion takes this row with it.
     */
    @Column(name = "question", nullable = false, columnDefinition = "text")
    private String question;

    @Column(name = "assistant_profile", nullable = false, length = 64)
    private String assistantProfile;

    @Column(name = "page_subject", length = 120)
    private String pageSubject;

    @Column(name = "evidence_level", nullable = false, length = 32)
    private String evidenceLevel;

    @Column(name = "occurrences", nullable = false)
    private int occurrences;

    @Column(name = "first_seen_at", nullable = false)
    private Instant firstSeenAt;

    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private GapStatus status;

    @Column(name = "resolution_reference", length = 200)
    private String resolutionReference;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected AuraKnowledgeGap() {
    }

    public static AuraKnowledgeGap first(String fingerprint, String question, String assistantProfile,
                                          String pageSubject, String evidenceLevel) {
        AuraKnowledgeGap gap = new AuraKnowledgeGap();
        gap.id = UUID.randomUUID();
        gap.fingerprint = fingerprint;
        gap.question = question;
        gap.assistantProfile = assistantProfile;
        gap.pageSubject = pageSubject;
        gap.evidenceLevel = evidenceLevel;
        gap.occurrences = 1;
        gap.status = GapStatus.OPEN;
        Instant now = Instant.now();
        gap.firstSeenAt = now;
        gap.lastSeenAt = now;
        return gap;
    }

    /**
     * Somebody asked it again. A gap that had been resolved and is being asked again is reopened —
     * that means the answer we wrote is not being found, which is a different problem from the
     * original gap and one worth surfacing rather than burying.
     */
    public void seenAgain(String evidenceLevel) {
        occurrences++;
        lastSeenAt = Instant.now();
        this.evidenceLevel = evidenceLevel;
        if (status == GapStatus.RESOLVED) {
            status = GapStatus.OPEN;
            resolutionReference = null;
        }
    }

    public void moveTo(GapStatus status, String resolutionReference) {
        this.status = status;
        this.resolutionReference = status == GapStatus.RESOLVED ? resolutionReference : null;
    }

    public UUID getId() {
        return id;
    }

    public String getFingerprint() {
        return fingerprint;
    }

    public String getQuestion() {
        return question;
    }

    public String getAssistantProfile() {
        return assistantProfile;
    }

    public String getPageSubject() {
        return pageSubject;
    }

    public String getEvidenceLevel() {
        return evidenceLevel;
    }

    public int getOccurrences() {
        return occurrences;
    }

    public Instant getFirstSeenAt() {
        return firstSeenAt;
    }

    public Instant getLastSeenAt() {
        return lastSeenAt;
    }

    public GapStatus getStatus() {
        return status;
    }

    public String getResolutionReference() {
        return resolutionReference;
    }
}
