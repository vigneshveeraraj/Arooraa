package com.arooraa.aura.ingestion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuraIngestionJobRepository extends JpaRepository<AuraIngestionJob, UUID> {

    List<AuraIngestionJob> findByDocumentVersionIdOrderByStartedAtDesc(UUID documentVersionId);
}
