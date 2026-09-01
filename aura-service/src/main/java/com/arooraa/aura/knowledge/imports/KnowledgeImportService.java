package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.repository.AuraDocumentRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

/**
 * Imports one explicitly-selected knowledge-seed file into {@code AuraDocument}/
 * {@code AuraDocumentVersion} — never scans a directory automatically (frozen A2 requirement: a
 * safe ingestion mechanism operating on explicitly selected documents only). Every imported
 * version starts life in {@code DRAFT}; import never approves anything itself, no matter what the
 * source file's editorial {@code review_status} says.
 *
 * <p>Idempotent: importing unchanged content twice returns the same existing version rather than
 * creating a duplicate. "Unchanged" means the {@link DocumentFingerprint} — normalized
 * retrieval-relevant metadata plus body — is identical, so a visibility, knowledge-space, title,
 * product or product-status change does create a new version, while a line-ending or
 * {@code review_status} edit does not.
 */
@Service
public class KnowledgeImportService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeImportService.class);

    private final AuraDocumentRepository documentRepository;
    private final AuraDocumentVersionRepository versionRepository;
    private final KnowledgeDocumentParser parser;

    public KnowledgeImportService(AuraDocumentRepository documentRepository,
                                   AuraDocumentVersionRepository versionRepository,
                                   KnowledgeDocumentParser parser) {
        this.documentRepository = documentRepository;
        this.versionRepository = versionRepository;
        this.parser = parser;
    }

    @Transactional
    public AuraDocumentVersion importFromFile(Path file) {
        String sourcePath = file.toString();
        String fileContent;
        try {
            fileContent = Files.readString(file, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read knowledge source file: " + sourcePath, e);
        }
        return importContent(sourcePath, fileContent);
    }

    @Transactional
    public AuraDocumentVersion importContent(String sourcePath, String fileContent) {
        ParsedKnowledgeDocument parsed = parser.parse(sourcePath, fileContent);
        // Fingerprints normalized retrieval-relevant metadata + body, not the raw file (A2.1) —
        // see DocumentFingerprint for exactly which fields participate and why.
        String checksum = DocumentFingerprint.of(parsed);

        AuraDocument document = documentRepository.findBySlug(parsed.slug())
                .orElseGet(() -> documentRepository.save(new AuraDocument(
                        parsed.slug(), parsed.title(), parsed.domain(), parsed.category(),
                        parsed.product(), parsed.service(), parsed.knowledgeSpace())));

        if (document.updateEditorialMetadata(parsed.title(), parsed.domain(), parsed.category(),
                parsed.product(), parsed.service(), parsed.knowledgeSpace())) {
            document = documentRepository.save(document);
            log.info("Refreshed editorial metadata for \"{}\" from its source.", parsed.slug());
        }

        Optional<AuraDocumentVersion> latest =
                versionRepository.findFirstByDocumentIdOrderByVersionNumberDesc(document.getId());
        if (latest.isPresent() && checksum.equals(latest.get().getContentChecksum())) {
            log.info("Import of \"{}\" is a no-op — retrieval-relevant content unchanged (fingerprint {}).",
                    parsed.slug(), checksum);
            return latest.get();
        }

        int nextVersionNumber = latest.map(v -> v.getVersionNumber() + 1).orElse(1);
        AuraDocumentVersion version = new AuraDocumentVersion(
                document.getId(), nextVersionNumber, parsed.visibility(), parsed.productStatus(),
                parsed.source(), parsed.body(), sourcePath, checksum);
        AuraDocumentVersion saved = versionRepository.save(version);
        log.info("Imported \"{}\" as version {} (checksum {}).", parsed.slug(), nextVersionNumber, checksum);
        return saved;
    }
}
