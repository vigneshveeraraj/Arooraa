package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.ConversationTone;
import com.arooraa.aura.retrieval.EvidenceLevel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Where A2.2's calibrated evidence levels turn into permissions for a turn. */
class GenerationPolicyTest {

    private final GenerationPolicy policy = new GenerationPolicy();

    @Test
    void strongEvidenceMayGroundAClaimAndCiteItsSources() {
        GenerationDecision decision = policy.decide(
                ConversationMode.GROUNDED_QA, EvidenceLevel.STRONG_EVIDENCE, ConversationTone.CURIOUS);

        assertTrue(decision.groundingAllowed());
        assertFalse(decision.mustQualify());
        assertFalse(decision.forbidArooraaFactualClaims());
        assertTrue(decision.includeSources());
    }

    @Test
    void weakEvidenceMayAnswerButMustQualify() {
        GenerationDecision decision = policy.decide(
                ConversationMode.GROUNDED_QA, EvidenceLevel.WEAK_EVIDENCE, ConversationTone.CURIOUS);

        assertTrue(decision.groundingAllowed());
        assertTrue(decision.mustQualify());
        assertTrue(decision.includeSources());
    }

    @Test
    void noEvidenceForbidsArooraaClaimsEntirely() {
        // "How many paying MESA customers do you have?" with nothing approved to answer it.
        GenerationDecision decision = policy.decide(
                ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE, ConversationTone.CURIOUS);

        assertFalse(decision.groundingAllowed());
        assertTrue(decision.forbidArooraaFactualClaims());
        assertFalse(decision.includeSources());
    }

    @Test
    void generalConsultingRunsOnGeneralKnowledgeAndClaimsNothingAboutUs() {
        GenerationDecision decision = policy.decide(
                ConversationMode.GENERAL_CONSULTING, EvidenceLevel.NO_EVIDENCE, ConversationTone.TECHNICAL);

        assertFalse(decision.groundingAllowed());
        assertTrue(decision.forbidArooraaFactualClaims(), "general knowledge must never become an AROORAA claim");
        assertFalse(decision.includeSources());
    }

    @Test
    void aBoundaryTurnNeitherGroundsNorCitesNorJokes() {
        GenerationDecision decision = policy.decide(
                ConversationMode.INTERNAL_BOUNDARY, EvidenceLevel.NO_EVIDENCE, ConversationTone.CASUAL);

        assertFalse(decision.groundingAllowed());
        assertTrue(decision.forbidArooraaFactualClaims());
        assertFalse(decision.includeSources(), "citing documents while declining would itself hint at what exists");
        assertFalse(decision.humourAllowed());
    }

    @Test
    void aGreetingClaimsNothingAndCitesNothingButStaysWarm() {
        GenerationDecision decision = policy.decide(
                ConversationMode.SOCIAL, EvidenceLevel.NO_EVIDENCE, ConversationTone.CASUAL);

        assertFalse(decision.groundingAllowed());
        assertTrue(decision.forbidArooraaFactualClaims());
        assertFalse(decision.includeSources(), "a hello has nothing to cite");
        assertTrue(decision.humourAllowed(), "greetings are exactly where a bit of warmth belongs");
    }

    @Test
    void humourFollowsTheVisitorsTone() {
        assertTrue(policy.decide(ConversationMode.PROJECT_DISCOVERY, EvidenceLevel.WEAK_EVIDENCE,
                ConversationTone.EXCITED).humourAllowed());
        assertFalse(policy.decide(ConversationMode.PROJECT_DISCOVERY, EvidenceLevel.WEAK_EVIDENCE,
                ConversationTone.FRUSTRATED).humourAllowed());
        assertFalse(policy.decide(ConversationMode.PROJECT_DISCOVERY, EvidenceLevel.WEAK_EVIDENCE,
                ConversationTone.SERIOUS).humourAllowed());
    }
}
