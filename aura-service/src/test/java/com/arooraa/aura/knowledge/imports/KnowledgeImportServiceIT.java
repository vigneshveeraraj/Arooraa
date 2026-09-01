package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.repository.AuraDocumentRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Proves the import pipeline's idempotency and versioning contract (A2 requirements): repeated
 * import of unchanged content is a no-op, changed content creates a new version rather than
 * mutating history, and malformed source is rejected safely.
 */
@Testcontainers
@SpringBootTest
class KnowledgeImportServiceIT {

    @Container
    static PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("pgvector/pgvector:pg16")
            .withStartupTimeout(java.time.Duration.ofMinutes(5))
            .withDatabaseName("arooraa_aura")
            .withUsername("arooraa_aura_app")
            .withPassword("integration-test-password");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    private KnowledgeImportService importService;

    @Autowired
    private AuraDocumentRepository documentRepository;

    @Autowired
    private AuraDocumentVersionRepository versionRepository;

    @TempDir
    Path tempDir;

    private String slug;

    @BeforeEach
    void freshSlugPerTest() {
        slug = "import-test-" + java.util.UUID.randomUUID();
    }

    private Path writeFile(String content) throws IOException {
        Path file = tempDir.resolve(slug + "-" + System.nanoTime() + ".md");
        Files.writeString(file, content, StandardCharsets.UTF_8);
        return file;
    }

    private String frontmatter(String body) {
        return """
                ---
                slug: %s
                title: Import Test Document
                domain: test
                category: test
                product: null
                service: null
                visibility: PUBLIC
                review_status: DRAFT
                source: test-fixture
                ---

                %s
                """.formatted(slug, body);
    }

    @Test
    void importingANewFileCreatesADocumentAndADraftVersion() throws IOException {
        Path file = writeFile(frontmatter("First body content."));

        AuraDocumentVersion version = importService.importFromFile(file);

        assertEquals(DocumentStatus.DRAFT, version.getStatus());
        assertEquals(1, version.getVersionNumber());
        AuraDocument document = documentRepository.findBySlug(slug).orElseThrow();
        assertEquals(document.getId(), version.getDocumentId());
    }

    @Test
    void reimportingUnchangedContentIsIdempotentAndCreatesNoNewVersion() throws IOException {
        Path file = writeFile(frontmatter("Unchanged body content."));

        AuraDocumentVersion first = importService.importFromFile(file);
        AuraDocumentVersion second = importService.importFromFile(file);

        assertEquals(first.getId(), second.getId());
        AuraDocument document = documentRepository.findBySlug(slug).orElseThrow();
        List<AuraDocumentVersion> versions = versionRepository.findByDocumentIdOrderByVersionNumberDesc(document.getId());
        assertEquals(1, versions.size(), "unchanged re-import must not create a duplicate version");
    }

    @Test
    void changedContentCreatesANewVersionRatherThanMutatingTheOld() throws IOException {
        Path file = writeFile(frontmatter("Original body content."));
        AuraDocumentVersion first = importService.importFromFile(file);

        Files.writeString(file, frontmatter("Updated body content — materially different."), StandardCharsets.UTF_8);
        AuraDocumentVersion second = importService.importFromFile(file);

        assertTrue(!first.getId().equals(second.getId()));
        assertEquals(2, second.getVersionNumber());

        AuraDocumentVersion reloadedFirst = versionRepository.findById(first.getId()).orElseThrow();
        assertTrue(reloadedFirst.getRawContent().contains("Original body content."),
                "the historical version's content must never be mutated in place");
    }

    @Test
    void malformedSourceIsRejectedAndNothingIsPersisted() throws IOException {
        Path file = writeFile("not frontmatter at all, just plain text");

        assertThrows(MalformedKnowledgeDocumentException.class, () -> importService.importFromFile(file));
        assertTrue(documentRepository.findBySlug(slug).isEmpty());
    }

    @Test
    void everyImportedVersionStartsInDraftRegardlessOfTheSeedFilesReviewStatus() throws IOException {
        String content = """
                ---
                slug: %s
                title: Import Test Document
                visibility: PUBLIC
                review_status: OWNER_APPROVED
                ---

                Body claiming to already be owner-approved.
                """.formatted(slug);
        Path file = writeFile(content);

        AuraDocumentVersion version = importService.importFromFile(file);

        assertEquals(DocumentStatus.DRAFT, version.getStatus(),
                "import must never auto-approve, no matter what review_status the source claims");
    }
}
