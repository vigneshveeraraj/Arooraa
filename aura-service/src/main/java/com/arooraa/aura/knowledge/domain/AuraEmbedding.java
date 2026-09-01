package com.arooraa.aura.knowledge.domain;

import com.arooraa.aura.knowledge.persistence.VectorType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.UUID;

/**
 * The embedding vector for one {@link AuraChunk} — deliberately its own table rather than a
 * column on {@code aura_chunks}:
 *
 * <ul>
 *   <li>a chunk can exist with zero embeddings (freshly created, not yet indexed) or need
 *       re-embedding (provider/model change) without an UPDATE on its content row;</li>
 *   <li>the pgvector ivfflat/hnsw index wants a narrow, dedicated table — indexing a wide row
 *       that also carries chunk text is wasteful and couples two independent lifecycles;</li>
 *   <li>{@code embeddingModel}/{@code dimensions} travel with the vector, not the chunk, because
 *       they describe how THIS vector was produced, not a property of the text.</li>
 * </ul>
 *
 * <p>Dimension is fixed per column ({@code vector(1536)}, V1) — pgvector's ivfflat/hnsw indexes
 * need a fixed width. 1536 matches common current embedding models; switching providers to a
 * different dimensionality needs a follow-up migration, not a schema that tries to be
 * dimension-agnostic (which pgvector can't index efficiently anyway).
 */
@Entity
@Table(name = "aura_embeddings")
public class AuraEmbedding {

    @Id
    private UUID id;

    @Column(name = "chunk_id", nullable = false, unique = true)
    private UUID chunkId;

    /** Config-driven identifier of the model that produced this vector — never hardcoded business logic (see {@code EmbeddingProvider}). */
    @Column(name = "embedding_model", nullable = false, length = 100)
    private String embeddingModel;

    @Column(name = "dimensions", nullable = false)
    private int dimensions;

    @Type(VectorType.class)
    @Column(name = "embedding", nullable = false, columnDefinition = "vector(1536)")
    private float[] embedding;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AuraEmbedding() {
    }

    public AuraEmbedding(UUID chunkId, String embeddingModel, float[] embedding) {
        this.id = UUID.randomUUID();
        this.chunkId = chunkId;
        this.embeddingModel = embeddingModel;
        this.embedding = embedding;
        this.dimensions = embedding.length;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getChunkId() {
        return chunkId;
    }

    public String getEmbeddingModel() {
        return embeddingModel;
    }

    public int getDimensions() {
        return dimensions;
    }

    public float[] getEmbedding() {
        return embedding;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
