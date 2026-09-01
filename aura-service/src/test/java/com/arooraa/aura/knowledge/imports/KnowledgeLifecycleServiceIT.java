package com.arooraa.aura.knowledge.imports;

import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.domain.Visibility;
import com.arooraa.aura.knowledge.repository.AuraDocumentRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Proves the human-in-the-loop guards {@link KnowledgeApprovalService} and {@link KnowledgeActivationService} add on top of the frozen A0/A1 domain lifecycle. */
@Testcontainers
@SpringBootTest
class KnowledgeLifecycleServiceIT {

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

    @Autowired
    private KnowledgeApprovalService approvalService;

    @Autowired
    private KnowledgeActivationService activationService;

    private UUID documentId;

    @BeforeEach
    void seedDocument() {
        documentId = documentRepository.save(
                new AuraDocument("lifecycle-" + UUID.randomUUID(), "Lifecycle Test", "test", null, null, null)).getId();
    }

    private AuraDocumentVersion draftVersion(int versionNumber) {
        return versionRepository.save(
                new AuraDocumentVersion(documentId, versionNumber, Visibility.PUBLIC, null, null, "Content v" + versionNumber));
    }

    @Test
    void approvingADraftVersionSucceeds() {
        AuraDocumentVersion version = draftVersion(1);

        AuraDocumentVersion approved = approvalService.approve(version.getId(), "owner@arooraa.com");

        assertEquals(DocumentStatus.APPROVED, approved.getStatus());
        assertEquals("owner@arooraa.com", approved.getApprovedBy());
    }

    @Test
    void approvingAnAlreadyApprovedVersionIsRejected() {
        AuraDocumentVersion version = draftVersion(1);
        approvalService.approve(version.getId(), "owner@arooraa.com");

        assertThrows(IllegalStateException.class, () -> approvalService.approve(version.getId(), "owner@arooraa.com"));
    }

    @Test
    void activatingANonIndexedVersionIsRejected() {
        AuraDocumentVersion version = draftVersion(1);
        approvalService.approve(version.getId(), "owner@arooraa.com");

        assertThrows(IllegalStateException.class, () -> activationService.activate(version.getId()));
    }

    @Test
    void activatingAnIndexedVersionDeactivatesThePreviouslyActiveOne() {
        AuraDocumentVersion first = draftVersion(1);
        approvalService.approve(first.getId(), "owner@arooraa.com");
        first = versionRepository.findById(first.getId()).orElseThrow();
        first.markIndexed();
        first = versionRepository.saveAndFlush(first);
        activationService.activate(first.getId());

        AuraDocumentVersion second = draftVersion(2);
        approvalService.approve(second.getId(), "owner@arooraa.com");
        second = versionRepository.findById(second.getId()).orElseThrow();
        second.markIndexed();
        second = versionRepository.saveAndFlush(second);
        activationService.activate(second.getId());

        AuraDocumentVersion reloadedFirst = versionRepository.findById(first.getId()).orElseThrow();
        AuraDocumentVersion reloadedSecond = versionRepository.findById(second.getId()).orElseThrow();
        assertTrue(!reloadedFirst.isActive(), "the superseded version must be deactivated");
        assertTrue(reloadedSecond.isActive());
    }
}
