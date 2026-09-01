package com.arooraa.aura.knowledge.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import com.arooraa.aura.support.Sha256;

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

    /** Nearest markdown heading this chunk's content sits under — preserves section context for lexical search and citation display (see {@code ChunkingService}). Null if the chunk precedes any heading. */
    @Column(name = "section_heading", length = 300)
    private String sectionHeading;

    /** SHA-256 hex of this chunk's final text — proves chunking is deterministic (same input, same checksum) and gives a stable per-chunk fingerprint independent of {@link #id}. */
    @Column(name = "checksum", nullable = false, length = 64)
    private String checksum;

    /** Best-effort source offsets into the owning version's rawContent — the span of NEW content this chunk primarily represents; an overlapping leading portion (see ChunkingService) may duplicate a few characters already counted in the previous chunk's span. Null if not computed. */
    @Column(name = "char_start")
    private Integer charStart;

    @Column(name = "char_end")
    private Integer charEnd;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AuraChunk() {
    }

    /** checksum is derived from content — every A0/A1 call site stays valid unchanged and still gets a real fingerprint. */
    public AuraChunk(UUID documentVersionId, int chunkIndex, String content, Integer tokenCount) {
        this(documentVersionId, chunkIndex, content, tokenCount, null, null, null);
    }

    public AuraChunk(UUID documentVersionId, int chunkIndex, String content, Integer tokenCount,
                      String sectionHeading, Integer charStart, Integer charEnd) {
        this.id = UUID.randomUUID();
        this.documentVersionId = documentVersionId;
        this.chunkIndex = chunkIndex;
        this.content = content;
        this.tokenCount = tokenCount;
        this.sectionHeading = sectionHeading;
        this.checksum = Sha256.hex(content);
        this.charStart = charStart;
        this.charEnd = charEnd;
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

    public String getSectionHeading() {
        return sectionHeading;
    }

    public String getChecksum() {
        return checksum;
    }

    public Integer getCharStart() {
        return charStart;
    }

    public Integer getCharEnd() {
        return charEnd;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
