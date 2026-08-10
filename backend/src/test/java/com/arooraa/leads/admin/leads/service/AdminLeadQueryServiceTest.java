package com.arooraa.leads.admin.leads.service;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The synthetic MESA reference is a pure, on-read-only derivation from a DemoRequest's id
 * (see AdminLeadQueryService.syntheticMesaReference Javadoc / docs/mesa-reference-number.md).
 * These tests exist specifically to prove that "pure function" claim: same id in, same
 * reference out, every time, regardless of how many times it's computed.
 */
class AdminLeadQueryServiceTest {

    @Test
    void syntheticMesaReferenceIsStableForTheSameId() {
        UUID id = UUID.fromString("1a2b3c4d-5e6f-4789-9abc-def012345678");

        String first = AdminLeadQueryService.syntheticMesaReference(id);
        String second = AdminLeadQueryService.syntheticMesaReference(id);

        assertEquals(first, second, "the same id must always produce the same reference");
        assertEquals("MESA-1A2B3C4D", first);
    }

    @Test
    void syntheticMesaReferenceMatchesTheDocumentedFormat() {
        for (int i = 0; i < 20; i++) {
            String reference = AdminLeadQueryService.syntheticMesaReference(UUID.randomUUID());
            assertTrue(reference.matches("^MESA-[0-9A-F]{8}$"), "unexpected format: " + reference);
        }
    }

    @Test
    void differentIdsProduceDifferentReferencesInPractice() {
        UUID a = UUID.fromString("11111111-1111-4111-9111-111111111111");
        UUID b = UUID.fromString("22222222-2222-4222-9222-222222222222");

        assertTrue(!AdminLeadQueryService.syntheticMesaReference(a)
                .equals(AdminLeadQueryService.syntheticMesaReference(b)));
    }
}
