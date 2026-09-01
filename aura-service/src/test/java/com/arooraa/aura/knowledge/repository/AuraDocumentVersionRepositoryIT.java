package com.arooraa.aura.knowledge.repository;

import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.domain.ProductStatus;
import com.arooraa.aura.knowledge.domain.Visibility;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Proves the public/approved retrieval boundary is enforced at the query layer, not only by
 * prompting (Phase A0/A1 security requirement), and that the "one active version per document"
 * invariant holds under a real unique-index constraint, not just application code.
 */
@Testcontainers
@SpringBootTest
class AuraDocumentVersionRepositoryIT {

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
    private AuraDocumentRepository documentRepository;

    @Autowired
    private AuraDocumentVersionRepository versionRepository;

    private UUID publicDocumentId;

    @BeforeEach
    void seedPublicDocument() {
        AuraDocument document = documentRepository.save(
                new AuraDocument("test-" + UUID.randomUUID(), "Test Document", "company", null, null, null));
        publicDocumentId = document.getId();
    }

    private AuraDocumentVersion approvedIndexedActive(UUID documentId, Visibility visibility, DocumentStatus status, boolean active) {
        AuraDocumentVersion version = new AuraDocumentVersion(documentId, 1, visibility, ProductStatus.AVAILABLE, null, "Content.");
        version.approve("owner@arooraa.com");
        if (status == DocumentStatus.INDEXED) {
            version.markIndexed();
        }
        if (active) {
            version.activate();
        }
        return versionRepository.save(version);
    }

    @Test
    void publicIndexedActiveVersionIsRetrievable() {
        AuraDocumentVersion eligible = approvedIndexedActive(publicDocumentId, Visibility.PUBLIC, DocumentStatus.INDEXED, true);

        List<AuraDocumentVersion> retrievable = versionRepository.findAllRetrievable();

        assertTrue(retrievable.stream().anyMatch(v -> v.getId().equals(eligible.getId())));
    }

    @Test
    void internalVisibilityIsNeverRetrievableEvenIfIndexedAndActive() {
        UUID documentId = documentRepository.save(
                new AuraDocument("internal-" + UUID.randomUUID(), "Internal note", "internal", null, null, null)).getId();
        AuraDocumentVersion internal = approvedIndexedActive(documentId, Visibility.INTERNAL, DocumentStatus.INDEXED, true);

        List<AuraDocumentVersion> retrievable = versionRepository.findAllRetrievable();

        assertTrue(retrievable.stream().noneMatch(v -> v.getId().equals(internal.getId())));
    }

    @Test
    void approvedButNotYetIndexedIsNotRetrievable() {
        UUID documentId = documentRepository.save(
                new AuraDocument("pending-" + UUID.randomUUID(), "Pending index", "company", null, null, null)).getId();
        AuraDocumentVersion approvedOnly = new AuraDocumentVersion(documentId, 1, Visibility.PUBLIC, null, null, "Content.");
        approvedOnly.approve("owner@arooraa.com");
        approvedOnly.activate();
        versionRepository.save(approvedOnly);

        List<AuraDocumentVersion> retrievable = versionRepository.findAllRetrievable();

        assertTrue(retrievable.stream().noneMatch(v -> v.getId().equals(approvedOnly.getId())));
    }

    @Test
    void inactiveIndexedVersionIsNotRetrievable() {
        AuraDocumentVersion inactive = approvedIndexedActive(publicDocumentId, Visibility.PUBLIC, DocumentStatus.INDEXED, false);

        List<AuraDocumentVersion> retrievable = versionRepository.findAllRetrievable();

        assertTrue(retrievable.stream().noneMatch(v -> v.getId().equals(inactive.getId())));
    }

    @Test
    void onlyOneActiveVersionPerDocumentIsAllowedAtTheDatabaseLevel() {
        AuraDocumentVersion first = new AuraDocumentVersion(publicDocumentId, 1, Visibility.PUBLIC, null, null, "v1");
        first.approve("owner@arooraa.com");
        first.markIndexed();
        first.activate();
        versionRepository.saveAndFlush(first);

        AuraDocumentVersion second = new AuraDocumentVersion(publicDocumentId, 2, Visibility.PUBLIC, null, null, "v2");
        second.approve("owner@arooraa.com");
        second.markIndexed();
        second.activate();

        // No @Transactional on this test: each repository call is its own auto-committing
        // transaction, so a lone save() already flushes (and can already throw) before an
        // explicit follow-up flush() would run — the save itself must be inside the assertion.
        assertThrows(DataIntegrityViolationException.class, () -> versionRepository.saveAndFlush(second));
    }

    @Test
    void deactivatingTheOldVersionThenActivatingTheNewOneSucceeds() {
        AuraDocumentVersion first = new AuraDocumentVersion(publicDocumentId, 1, Visibility.PUBLIC, null, null, "v1");
        first.approve("owner@arooraa.com");
        first.markIndexed();
        first.activate();
        // save()/saveAndFlush() on an entity with a manually-assigned (non-generated) @Id can
        // return a different managed instance than the one passed in — always reassign, or a
        // later mutate-then-save on the stale original silently drops JPA-managed state
        // (here, the created_at value @PrePersist set on the managed copy).
        first = versionRepository.saveAndFlush(first);

        first.deactivate();
        first = versionRepository.saveAndFlush(first);

        AuraDocumentVersion second = new AuraDocumentVersion(publicDocumentId, 2, Visibility.PUBLIC, null, null, "v2");
        second.approve("owner@arooraa.com");
        second.markIndexed();
        second.activate();
        second = versionRepository.saveAndFlush(second);

        var active = versionRepository.findByDocumentIdAndActiveTrue(publicDocumentId);
        assertTrue(active.isPresent());
        assertEquals(second.getId(), active.get().getId());
    }
}
