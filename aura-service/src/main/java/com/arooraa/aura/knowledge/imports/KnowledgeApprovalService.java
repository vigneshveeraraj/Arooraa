package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * The one human-in-the-loop step between import and ingestion. {@link AuraDocumentVersion#approve}
 * itself doesn't validate the current status (kept exactly as accepted in A0/A1); this service
 * adds that guard on top, without touching the entity — only a {@code DRAFT} or {@code IN_REVIEW}
 * version may be approved, so an already-{@code APPROVED}/{@code INDEXED}/{@code ARCHIVED} version
 * can't be silently re-approved through this path.
 */
@Service
public class KnowledgeApprovalService {

    private final AuraDocumentVersionRepository versionRepository;

    public KnowledgeApprovalService(AuraDocumentVersionRepository versionRepository) {
        this.versionRepository = versionRepository;
    }

    @Transactional
    public AuraDocumentVersion approve(UUID documentVersionId, String approvedBy) {
        AuraDocumentVersion version = versionRepository.findById(documentVersionId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown document version: " + documentVersionId));

        if (version.getStatus() != DocumentStatus.DRAFT && version.getStatus() != DocumentStatus.IN_REVIEW) {
            throw new IllegalStateException(
                    "Only a DRAFT or IN_REVIEW version can be approved (was " + version.getStatus() + "): "
                            + documentVersionId);
        }

        version.approve(approvedBy);
        return versionRepository.save(version);
    }
}
