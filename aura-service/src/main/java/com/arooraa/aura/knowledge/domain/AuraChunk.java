package com.arooraa.aura.knowledge.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * One retrieval-sized slice of an {@link AuraDocumentVersion}'s approved content. Chunks hold
 * only text — the vector lives on a separate {@link AuraEmbedding} row (see that class's Javadoc
 * for why), so re-embedding never requires touching or duplicating the source text.
 */
@Entity
@Table(name = "aura_chunks")
public class AuraChunk {

    @Id
    private UUID id;

    @Column(name = "document_version_id", nullable = false)
    private UUID documentVersionId;

    /** Order within the version, starting at 0 — preserves reading order for citation/debugging. */
    @Column(name = "chunk_index", nullable = false)
    private int chunkIndex;

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content;

    /** Informational only — not used for any business rule in this milestone. */
    @Column(name = "token_count")
    private Integer tokenCount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AuraChunk() {
    }

    public AuraChunk(UUID documentVersionId, int chunkIndex, String content, Integer tokenCount) {
        this.id = UUID.randomUUID();
        this.documentVersionId = documentVersionId;
        this.chunkIndex = chunkIndex;
        this.content = content;
        this.tokenCount = tokenCount;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getDocumentVersionId() {
        return documentVersionId;
    }

    public int getChunkIndex() {
        return chunkIndex;
    }

    public String getContent() {
        return content;
    }

    public Integer getTokenCount() {
        return tokenCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
