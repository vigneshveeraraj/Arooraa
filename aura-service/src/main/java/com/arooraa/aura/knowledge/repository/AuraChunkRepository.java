package com.arooraa.aura.knowledge.repository;

import com.arooraa.aura.knowledge.domain.AuraChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AuraChunkRepository extends JpaRepository<AuraChunk, UUID> {

    List<AuraChunk> findByDocumentVersionIdOrderByChunkIndex(UUID documentVersionId);

    /**
     * Same PUBLIC+INDEXED+active boundary as {@code AuraDocumentVersionRepository.findAllRetrievable},
     * expressed at chunk granularity — this is the shape a real similarity search extends (adding
     * a join to {@code aura_embeddings} and an ORDER BY distance/LIMIT) once retrieval is built.
     * Chunks/embeddings deliberately don't duplicate visibility/status themselves; the boundary
     * always flows from the document version.
     */
    @Query("""
            select c from AuraChunk c
            where c.documentVersionId in (
                select v.id from AuraDocumentVersion v
                where v.active = true
                  and v.visibility = com.arooraa.aura.knowledge.domain.Visibility.PUBLIC
                  and v.status = com.arooraa.aura.knowledge.domain.DocumentStatus.INDEXED
            )
            """)
    List<AuraChunk> findAllRetrievable();
}
