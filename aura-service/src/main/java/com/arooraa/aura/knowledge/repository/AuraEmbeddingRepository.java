package com.arooraa.aura.knowledge.repository;

import com.arooraa.aura.knowledge.domain.AuraEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuraEmbeddingRepository extends JpaRepository<AuraEmbedding, UUID> {

    Optional<AuraEmbedding> findByChunkId(UUID chunkId);
}
