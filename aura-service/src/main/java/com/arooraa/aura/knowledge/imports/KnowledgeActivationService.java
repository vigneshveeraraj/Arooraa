package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Publishes an {@code INDEXED} version as the document's current/active one — the final editorial
 * step before it's retrievable (retrieval eligibility requires {@code active = true}, see
 * {@code AuraDocumentVersionRepository}). Deactivates whatever version was previously active for
 * the same document first, so the database's one-active-version invariant (V1's partial unique
 * index) is never violated — same sequencing already proven in
 * {@code AuraDocumentVersionRepositoryIT.deactivatingTheOldVersionThenActivatingTheNewOneSucceeds}.
 */
@Service
public class KnowledgeActivationService {

    private final AuraDocumentVersionRepository versionRepository;

    public KnowledgeActivationService(AuraDocumentVersionRepository versionRepository) {
        this.versionRepository = versionRepository;
    }

    @Transactional
    public AuraDocumentVersion activate(UUID documentVersionId) {
        AuraDocumentVersion version = versionRepository.findById(documentVersionId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown document version: " + documentVersionId));

        if (version.getStatus() != DocumentStatus.INDEXED) {
            throw new IllegalStateException(
                    "Only an INDEXED version can be activated (was " + version.getStatus() + "): " + documentVersionId);
        }

        versionRepository.findByDocumentIdAndActiveTrue(version.getDocumentId())
                .filter(current -> !current.getId().equals(version.getId()))
                .ifPresent(current -> {
                    current.deactivate();
                    versionRepository.saveAndFlush(current);
                });

        version.activate();
        return versionRepository.saveAndFlush(version);
    }
}
