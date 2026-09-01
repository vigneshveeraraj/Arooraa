package com.arooraa.aura.knowledge.domain;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Approval/lifecycle/visibility rules — pure domain logic, no Spring context, no DB. */
class AuraDocumentVersionTest {

    @Test
    void newVersionStartsAsDraftAndInactive() {
        AuraDocumentVersion version = new AuraDocumentVersion(
                UUID.randomUUID(), 1, Visibility.PUBLIC, null, null, "Some approved content.");

        assertEquals(DocumentStatus.DRAFT, version.getStatus());
        assertFalse(version.isActive());
        assertNull(version.getApprovedAt());
    }

    @Test
    void approvalMovesDraftToApprovedAndRecordsWho() {
        AuraDocumentVersion version = new AuraDocumentVersion(
                UUID.randomUUID(), 1, Visibility.PUBLIC, null, null, "Content.");

        version.submitForReview();
        assertEquals(DocumentStatus.IN_REVIEW, version.getStatus());

        version.approve("owner@arooraa.com");

        assertEquals(DocumentStatus.APPROVED, version.getStatus());
        assertEquals("owner@arooraa.com", version.getApprovedBy());
        assertNotNull(version.getApprovedAt());
        assertNotNull(version.getEffectiveFrom());
    }

    @Test
    void onlyIndexingMovesApprovedToIndexed() {
        AuraDocumentVersion version = new AuraDocumentVersion(
                UUID.randomUUID(), 1, Visibility.PUBLIC, null, null, "Content.");
        version.approve("owner@arooraa.com");

        assertEquals(DocumentStatus.APPROVED, version.getStatus());
        version.markIndexed();
        assertEquals(DocumentStatus.INDEXED, version.getStatus());
    }

    @Test
    void archivingDeactivatesAndMarksArchived() {
        AuraDocumentVersion version = new AuraDocumentVersion(
                UUID.randomUUID(), 1, Visibility.PUBLIC, null, null, "Content.");
        version.approve("owner@arooraa.com");
        version.markIndexed();
        version.activate();
        assertTrue(version.isActive());

        version.archive();

        assertEquals(DocumentStatus.ARCHIVED, version.getStatus());
        assertFalse(version.isActive());
    }

    @Test
    void internalVisibilityIsRepresentedDistinctlyFromPublic() {
        AuraDocumentVersion internal = new AuraDocumentVersion(
                UUID.randomUUID(), 1, Visibility.INTERNAL, null, null, "Editorial note, never public.");

        assertEquals(Visibility.INTERNAL, internal.getVisibility());
    }

    @Test
    void productStatusIsOptionalAndDefaultsToNullForNonProductDocuments() {
        AuraDocumentVersion policyDoc = new AuraDocumentVersion(
                UUID.randomUUID(), 1, Visibility.PUBLIC, null, null, "Aura confidentiality policy.");

        assertNull(policyDoc.getProductStatus());
    }

    @Test
    void productStatusIsCarriedWhenSet() {
        AuraDocumentVersion productDoc = new AuraDocumentVersion(
                UUID.randomUUID(), 1, Visibility.PUBLIC, ProductStatus.BETA, null, "Smart Mirror overview.");

        assertEquals(ProductStatus.BETA, productDoc.getProductStatus());
    }
}
