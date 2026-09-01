package com.arooraa.aura.knowledge.repository;

import com.arooraa.aura.knowledge.domain.AuraEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuraEmbeddingRepository extends JpaRepository<AuraEmbedding, UUID> {

    /** A chunk can hold one vector per embedding generation (V3), so a lookup must name the generation it means. */
    Optional<AuraEmbedding> findByChunkIdAndGeneration(UUID chunkId, int generation);

    List<AuraEmbedding> findByChunkId(UUID chunkId);

    boolean existsByChunkIdAndGeneration(UUID chunkId, int generation);
}
