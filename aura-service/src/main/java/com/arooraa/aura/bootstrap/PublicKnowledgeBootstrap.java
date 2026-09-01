package com.arooraa.aura.bootstrap;

import com.arooraa.aura.ingestion.IngestionService;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.domain.KnowledgeSpaces;
import com.arooraa.aura.knowledge.domain.Visibility;
import com.arooraa.aura.knowledge.imports.KnowledgeActivationService;
import com.arooraa.aura.knowledge.imports.KnowledgeApprovalService;
import com.arooraa.aura.knowledge.imports.KnowledgeDocumentParser;
import com.arooraa.aura.knowledge.imports.KnowledgeImportService;
import com.arooraa.aura.knowledge.imports.ParsedKnowledgeDocument;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.config.ProviderProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

/**
 * Loads AROORAA's approved public knowledge into a local database, so preparing an Aura instance is
 * an operator action rather than something only a test fixture knows how to do.
 *
 * <p>It runs the accepted A2 pipeline unchanged — import → approve → chunk → embed → activate — and
 * bypasses none of it. No SQL is written directly, no version is fabricated, no fingerprint rule is
 * skipped. What this class adds is the decision of <em>which</em> documents to feed it, and the
 * preconditions to refuse when the answer would be wrong.
 *
 * <p>Three independent conditions decide eligibility, and a document must satisfy all three:
 * {@code visibility: PUBLIC}, {@code knowledge_space: AROORAA_PUBLIC}, and a {@code review_status}
 * other than {@code NEEDS_OWNER_APPROVAL}. The first two keep Aura's own policy documents out of
 * visitor-retrievable knowledge; the third respects the seed's own marker for content carrying a
 * claim the owner has not confirmed. Anything else is skipped, by name, with the reason.
 *
 * <p>Off unless {@code aura.bootstrap.public-knowledge=true}, and there is deliberately no HTTP
 * equivalent: knowledge mutation has no endpoint anywhere in this service.
 */
@Component
@ConditionalOnProperty(prefix = "aura.bootstrap", name = "public-knowledge", havingValue = "true")
public class PublicKnowledgeBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PublicKnowledgeBootstrap.class);
    private static final String NEEDS_OWNER_APPROVAL = "NEEDS_OWNER_APPROVAL";

    private final KnowledgeDocumentParser parser;
    private final KnowledgeImportService importService;
    private final KnowledgeApprovalService approvalService;
    private final IngestionService ingestionService;
    private final KnowledgeActivationService activationService;
    private final AuraDocumentVersionRepository versionRepository;
    private final EmbeddingProvider embeddingProvider;
    private final ProviderProperties providerProperties;
    private final BootstrapProperties properties;
    private final ConfigurableApplicationContext applicationContext;

    public PublicKnowledgeBootstrap(KnowledgeDocumentParser parser,
                                     KnowledgeImportService importService,
                                     KnowledgeApprovalService approvalService,
                                     IngestionService ingestionService,
                                     KnowledgeActivationService activationService,
                                     AuraDocumentVersionRepository versionRepository,
                                     EmbeddingProvider embeddingProvider,
                                     ProviderProperties providerProperties,
                                     BootstrapProperties properties,
                                     ConfigurableApplicationContext applicationContext) {
        this.parser = parser;
        this.importService = importService;
        this.approvalService = approvalService;
        this.ingestionService = ingestionService;
        this.activationService = activationService;
        this.versionRepository = versionRepository;
        this.embeddingProvider = embeddingProvider;
        this.providerProperties = providerProperties;
        this.properties = properties;
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(ApplicationArguments args) {
        BootstrapSummary summary = bootstrap();
        if (properties.exitAfterBootstrap()) {
            log.info("Bootstrap complete — exiting as requested (aura.bootstrap.exit-after-bootstrap=true).");
            System.exit(SpringApplication.exit(applicationContext, () -> summary.failed().isEmpty() ? 0 : 1));
        }
    }

    /**
     * Loads every eligible document and reports what happened. Safe to run repeatedly: an unchanged
     * document re-imports to the same version, which is already INDEXED and active, so the run is a
     * genuine no-op rather than a second copy.
     */
    public BootstrapSummary bootstrap() {
        verifyEmbeddingConfiguration();

        Path directory = Path.of(properties.sourceDirectory());
        if (!Files.isDirectory(directory)) {
            throw new IllegalStateException("Knowledge source directory not found: " + directory.toAbsolutePath()
                    + " — set aura.bootstrap.source-directory to where the approved documents live.");
        }

        List<String> indexed = new ArrayList<>();
        List<String> unchanged = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        List<String> failed = new ArrayList<>();

        log.info("Bootstrapping approved public knowledge from {} into embedding generation {}.",
                directory.toAbsolutePath(), providerProperties.embedding().generation());

        for (Path file : markdownFilesIn(directory)) {
            String sourcePath = file.toString();
            String content = read(file);
            ParsedKnowledgeDocument parsed;
            try {
                parsed = parser.parse(sourcePath, content);
            } catch (RuntimeException e) {
                failed.add(file.getFileName() + " (unparseable: " + e.getClass().getSimpleName() + ")");
                continue;
            }

            String ineligibility = ineligibilityReason(parsed);
            if (ineligibility != null) {
                skipped.add(parsed.slug() + " (" + ineligibility + ")");
                continue;
            }

            try {
                if (loadDocument(sourcePath, content)) {
                    indexed.add(parsed.slug());
                } else {
                    unchanged.add(parsed.slug());
                }
            } catch (RuntimeException e) {
                // The message, never the document: a failure log must not become a way to read
                // content that failed a visibility check earlier in the pipeline.
                log.warn("Bootstrap failed for \"{}\": {}", parsed.slug(), e.getMessage());
                failed.add(parsed.slug());
            }
        }

        BootstrapSummary summary = new BootstrapSummary(
                List.copyOf(indexed), List.copyOf(unchanged), List.copyOf(skipped), List.copyOf(failed));
        logSummary(summary);
        return summary;
    }

    /**
     * Refuses to start loading when the embedding configuration cannot produce usable vectors.
     * Without this the pipeline would still "succeed" document by document while every ingestion job
     * failed, leaving a database full of approved-but-unsearchable content and an operator with no
     * idea why Aura cannot answer anything.
     */
    private void verifyEmbeddingConfiguration() {
        ProviderProperties.Embedding embedding = providerProperties.embedding();
        if (!embeddingProvider.isEnabled()) {
            throw new IllegalStateException(
                    "Bootstrap needs a working embedding provider, but none is enabled. Set "
                            + "aura.provider.embedding.enabled=true with a valid provider and credential "
                            + "before loading knowledge.");
        }
        if (embeddingProvider.dimensions() != embedding.dimensions()) {
            throw new IllegalStateException(
                    "Embedding configuration mismatch: the provider produces " + embeddingProvider.dimensions()
                            + "-dimension vectors but aura.provider.embedding.dimensions is " + embedding.dimensions()
                            + ". Loading would write vectors that retrieval cannot compare.");
        }
        if (embedding.generation() < 1) {
            throw new IllegalStateException(
                    "aura.provider.embedding.generation must be a positive cohort number, but is "
                            + embedding.generation() + ".");
        }
    }

    /** @return null when the document may be indexed, otherwise why it may not. */
    private String ineligibilityReason(ParsedKnowledgeDocument parsed) {
        if (parsed.visibility() != Visibility.PUBLIC) {
            return "visibility=" + parsed.visibility();
        }
        if (!KnowledgeSpaces.AROORAA_PUBLIC.equals(parsed.knowledgeSpace())) {
            return "knowledge_space=" + parsed.knowledgeSpace();
        }
        if (NEEDS_OWNER_APPROVAL.equalsIgnoreCase(parsed.reviewStatus())) {
            return "review_status=NEEDS_OWNER_APPROVAL";
        }
        return null;
    }

    /** @return true if this run actually indexed something new, false if the document was already current. */
    private boolean loadDocument(String sourcePath, String content) {
        AuraDocumentVersion version = importService.importContent(sourcePath, content);

        if (version.getStatus() == DocumentStatus.INDEXED && version.isActive()) {
            return false;
        }
        if (version.getStatus() == DocumentStatus.DRAFT || version.getStatus() == DocumentStatus.IN_REVIEW) {
            approvalService.approve(version.getId(), properties.approvedBy());
        }
        version = reload(version);
        if (version.getStatus() == DocumentStatus.APPROVED) {
            ingestionService.ingest(version.getId());
        }
        version = reload(version);
        if (version.getStatus() == DocumentStatus.INDEXED && !version.isActive()) {
            activationService.activate(version.getId());
        }

        AuraDocumentVersion finalVersion = reload(version);
        if (finalVersion.getStatus() != DocumentStatus.INDEXED || !finalVersion.isActive()) {
            throw new IllegalStateException("version " + finalVersion.getVersionNumber()
                    + " ended in status " + finalVersion.getStatus() + " (active=" + finalVersion.isActive() + ")");
        }
        return true;
    }

    private AuraDocumentVersion reload(AuraDocumentVersion version) {
        return versionRepository.findById(version.getId()).orElseThrow();
    }

    private List<Path> markdownFilesIn(Path directory) {
        try (Stream<Path> files = Files.list(directory)) {
            return files
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".md"))
                    .filter(path -> !path.getFileName().toString().equalsIgnoreCase("README.md"))
                    .sorted(Comparator.comparing(path -> path.getFileName().toString()))
                    .toList();
        } catch (IOException e) {
            throw new UncheckedIOException("Could not list knowledge source directory: " + directory, e);
        }
    }

    private String read(Path file) {
        try {
            return Files.readString(file, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read knowledge source file: " + file, e);
        }
    }

    private void logSummary(BootstrapSummary summary) {
        log.info("Bootstrap summary — indexed: {}", summary.indexed());
        log.info("Bootstrap summary — already current: {}", summary.unchanged());
        log.info("Bootstrap summary — skipped: {}", summary.skipped());
        if (!summary.failed().isEmpty()) {
            log.error("Bootstrap summary — FAILED: {}", summary.failed());
        }
        log.info("Bootstrap finished: {} document(s) considered, {} now retrievable.",
                summary.total(), summary.indexed().size() + summary.unchanged().size());
    }
}
