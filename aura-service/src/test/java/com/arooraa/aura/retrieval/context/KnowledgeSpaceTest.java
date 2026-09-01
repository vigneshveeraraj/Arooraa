package com.arooraa.aura.retrieval.context;

import com.arooraa.aura.knowledge.domain.AuraDocument;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * {@code knowledge.domain} can't reference this package (retrieval already depends on domain, a
 * back-reference would be a cycle), so {@code AuraDocument}'s default-constructor literal and
 * {@link KnowledgeSpace#AROORAA_PUBLIC} are kept in sync by convention — this test is that
 * convention's enforcement.
 */
class KnowledgeSpaceTest {

    @Test
    void auraDocumentsDefaultKnowledgeSpaceMatchesTheRetrievalConstant() {
        AuraDocument document = new AuraDocument("sync-test", "Sync Test", null, null, null, null);

        assertEquals(KnowledgeSpace.AROORAA_PUBLIC, document.getKnowledgeSpace());
    }
}
