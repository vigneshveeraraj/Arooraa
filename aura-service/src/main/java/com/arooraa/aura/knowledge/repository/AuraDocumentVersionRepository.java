package com.arooraa.aura.knowledge.repository;

import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuraDocumentVersionRepository extends JpaRepository<AuraDocumentVersion, UUID> {

    Optional<AuraDocumentVersion> findByDocumentIdAndActiveTrue(UUID documentId);

    List<AuraDocumentVersion> findByDocumentIdOrderByVersionNumberDesc(UUID documentId);

    /**
     * The public/approved retrieval boundary, enforced here at the query layer rather than only
     * through prompting (Phase A0/A1 security requirement): a version is eligible for Aura's
     * retrieval path if and only if it is the document's currently active version, its
     * visibility is PUBLIC, and it has actually been indexed (approved alone isn't enough — an
     * approved-but-not-yet-embedded version has no chunks/embeddings for retrieval to use).
     */
    @Query("""
            select v from AuraDocumentVersion v
            where v.active = true
              and v.visibility = com.arooraa.aura.knowledge.domain.Visibility.PUBLIC
              and v.status = com.arooraa.aura.knowledge.domain.DocumentStatus.INDEXED
            """)
    List<AuraDocumentVersion> findAllRetrievable();
}
