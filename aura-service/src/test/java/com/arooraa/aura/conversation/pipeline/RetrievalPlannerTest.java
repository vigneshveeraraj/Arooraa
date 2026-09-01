package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RetrievalPlannerTest {

    private final RetrievalPlanner planner = new RetrievalPlanner();

    private static ScopeDecision turn(ConversationMode mode) {
        return new ScopeDecision(mode, ConfidentialityVerdict.allowed(), false);
    }

    private static ScopeDecision turnAboutUs(ConversationMode mode) {
        return new ScopeDecision(mode, ConfidentialityVerdict.allowed(), true);
    }

    @ParameterizedTest
    @EnumSource(value = ConversationMode.class,
            names = {"GROUNDED_QA", "PRODUCT_DISCOVERY", "NAVIGATION", "CAREERS"})
    void modesThatCanMakeArooraaClaimsSearchApprovedKnowledge(ConversationMode mode) {
        assertTrue(planner.decide(turn(mode)).retrieve(), mode.name());
    }

    @Test
    void aBoundaryTurnRetrievesNothingAtAll() {
        // The structural half of the confidentiality guarantee: with no retrieval there is no
        // corpus text in the prompt, so there is nothing for a jailbreak to extract.
        RetrievalDecision decision = planner.decide(turn(ConversationMode.INTERNAL_BOUNDARY));

        assertFalse(decision.retrieve());
        assertTrue(decision.reason().contains("CONFIDENTIALITY"));
    }

    @Test
    void generalConsultingAndOutOfScopeDoNotSearch() {
        assertFalse(planner.decide(turn(ConversationMode.GENERAL_CONSULTING)).retrieve());
        assertFalse(planner.decide(turn(ConversationMode.OUT_OF_SCOPE)).retrieve());
    }

    @Test
    void smallTalkDoesNotSearch() {
        // A2.2's gate cannot save a query that should never have run: given "hi" it faithfully
        // ranks whatever is nearest and reports the best of a bad field. The fix is not searching.
        RetrievalDecision decision = planner.decide(turn(ConversationMode.SOCIAL));

        assertFalse(decision.retrieve());
        assertTrue(decision.reason().contains("SOCIAL"));
    }

    @Test
    void aDiscoveryOpenerHasNothingToLookUp() {
        // "I have a software product idea" — there is no question in it yet, so searching returns
        // the same nearest-vector noise a greeting used to.
        RetrievalDecision decision = planner.decide(turn(ConversationMode.PROJECT_DISCOVERY));

        assertFalse(decision.retrieve());
        assertTrue(decision.reason().contains("NOTHING_TO_LOOK_UP"), decision.reason());
    }

    @Test
    void aDiscoveryTurnThatAsksAboutUsMaySearch() {
        // "I have a product idea — what services can AROORAA provide to build it?" is still
        // discovery, but it contains a real question about us and deserves a grounded answer.
        RetrievalDecision decision = planner.decide(turnAboutUs(ConversationMode.PROJECT_DISCOVERY));

        assertTrue(decision.retrieve());
        assertTrue(decision.reason().contains("ASKS_ABOUT_US"), decision.reason());
    }

    @Test
    void namingOneOfOurProductsDoesNotMakeSmallTalkOrABoundaryTurnSearch() {
        // The organisation signal only ever widens PROJECT_DISCOVERY. It must not reopen retrieval
        // for a mode that closed it for a safety reason — "Hey Aura" names a product too.
        assertFalse(planner.decide(turnAboutUs(ConversationMode.SOCIAL)).retrieve());
        assertFalse(planner.decide(turnAboutUs(ConversationMode.INTERNAL_BOUNDARY)).retrieve());
        assertFalse(planner.decide(turnAboutUs(ConversationMode.GENERAL_CONSULTING)).retrieve());
    }
}
