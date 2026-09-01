package com.arooraa.aura.retrieval;

import com.arooraa.aura.ingestion.IngestionService;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.imports.KnowledgeActivationService;
import com.arooraa.aura.knowledge.imports.KnowledgeApprovalService;
import com.arooraa.aura.knowledge.imports.KnowledgeImportService;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;

import java.nio.file.Path;
import java.util.List;

/**
 * Seeds the A2.1 evaluation corpus: the reviewed public subset carried over from A2, one real
 * INTERNAL policy document, and the three synthetic adversarial fixtures.
 *
 * <p>Shared by the secretless acceptance run and the real-provider calibration run so both measure
 * exactly the same corpus. Every step re-reads the version's real current status first, so running
 * it repeatedly is a genuine no-op rather than a re-throw.
 */
final class KnowledgeCorpusFixture {

    /** Deliberately NOT the full 27-document seed — only what the owner reviewed and approved (frozen A2/A2.1 requirement). */
    static final List<String> PUBLIC_SLUGS = List.of(
            "01-company-overview", "02-company-philosophy", "03-how-arooraa-works",
            "10-mesa", "11-mindra", "21-product-engineering", "22-ai-data-automation",
            "23-application-modernization");

    /**
     * A real Aura policy document, pushed through the same pipeline as everything else. It is
     * INTERNAL and lives in the AURA_POLICY knowledge space, so it proves both controls on real
     * content rather than only on synthetic fixtures.
     */
    static final String POLICY_SLUG = "91-aura-confidentiality-and-safety";

    static final List<String> FIXTURE_SLUGS = List.of(
            "99-internal-test-fixture",       // INTERNAL, authorized space
            "98-internal-provider-fixture",   // INTERNAL, authorized space
            "97-unauthorized-space-fixture"); // PUBLIC, unauthorized space

    private final KnowledgeImportService importService;
    private final KnowledgeApprovalService approvalService;
    private final IngestionService ingestionService;
    private final KnowledgeActivationService activationService;
    private final AuraDocumentVersionRepository versionRepository;

    KnowledgeCorpusFixture(KnowledgeImportService importService,
                            KnowledgeApprovalService approvalService,
                            IngestionService ingestionService,
                            KnowledgeActivationService activationService,
                            AuraDocumentVersionRepository versionRepository) {
        this.importService = importService;
        this.approvalService = approvalService;
        this.ingestionService = ingestionService;
        this.activationService = activationService;
        this.versionRepository = versionRepository;
    }

    /** Imports, approves, ingests and activates the whole evaluation corpus. Returns the activated version ids. */
    List<AuraDocumentVersion> seedAll() {
        return java.util.stream.Stream.of(
                        PUBLIC_SLUGS.stream().map(KnowledgeCorpusFixture::seedPath),
                        java.util.stream.Stream.of(seedPath(POLICY_SLUG)),
                        FIXTURE_SLUGS.stream().map(KnowledgeCorpusFixture::fixturePath))
                .flatMap(s -> s)
                .map(this::indexAndActivate)
                .toList();
    }

    static Path seedPath(String slug) {
        return Path.of("knowledge-seed", slug + ".md");
    }

    static Path fixturePath(String slug) {
        return Path.of("src", "test", "resources", "fixtures", slug + ".md");
    }

    AuraDocumentVersion indexAndActivate(Path file) {
        AuraDocumentVersion version = importService.importFromFile(file);

        version = reload(version);
        if (version.getStatus() == DocumentStatus.DRAFT || version.getStatus() == DocumentStatus.IN_REVIEW) {
            approvalService.approve(version.getId(), "a2-1-calibration@arooraa.com");
        }

        version = reload(version);
        if (version.getStatus() == DocumentStatus.APPROVED) {
            ingestionService.ingest(version.getId());
        }

        version = reload(version);
        if (version.getStatus() == DocumentStatus.INDEXED && !version.isActive()) {
            activationService.activate(version.getId());
        }
        return reload(version);
    }

    /** Re-embeds the whole corpus at the currently configured embedding generation (used by the real-provider run). */
    void reembedAll(List<AuraDocumentVersion> versions) {
        for (AuraDocumentVersion version : versions) {
            ingestionService.reembed(version.getId());
        }
    }

    private AuraDocumentVersion reload(AuraDocumentVersion version) {
        return versionRepository.findById(version.getId()).orElseThrow();
    }
}
