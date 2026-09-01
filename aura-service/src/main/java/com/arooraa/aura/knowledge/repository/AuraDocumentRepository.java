package com.arooraa.aura.knowledge.repository;

import com.arooraa.aura.knowledge.domain.AuraDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuraDocumentRepository extends JpaRepository<AuraDocument, UUID> {

    Optional<AuraDocument> findBySlug(String slug);
}
