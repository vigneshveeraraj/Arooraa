package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RetrievalPlannerTest {

    private final RetrievalPlanner planner = new RetrievalPlanner();

    @ParameterizedTest
    @EnumSource(value = ConversationMode.class,
            names = {"GROUNDED_QA", "PRODUCT_DISCOVERY", "PROJECT_DISCOVERY", "NAVIGATION", "CAREERS"})
    void modesThatCanMakeArooraaClaimsSearchApprovedKnowledge(ConversationMode mode) {
        assertTrue(planner.decide(mode).retrieve(), mode.name());
    }

    @Test
    void aBoundaryTurnRetrievesNothingAtAll() {
        // The structural half of the confidentiality guarantee: with no retrieval there is no
        // corpus text in the prompt, so there is nothing for a jailbreak to extract.
        RetrievalDecision decision = planner.decide(ConversationMode.INTERNAL_BOUNDARY);

        assertFalse(decision.retrieve());
        assertTrue(decision.reason().contains("CONFIDENTIALITY"));
    }

    @Test
    void generalConsultingAndOutOfScopeDoNotSearch() {
        assertFalse(planner.decide(ConversationMode.GENERAL_CONSULTING).retrieve());
        assertFalse(planner.decide(ConversationMode.OUT_OF_SCOPE).retrieve());
    }
}
