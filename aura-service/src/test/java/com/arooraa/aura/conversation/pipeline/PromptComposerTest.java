package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.config.ChatProperties;
import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.ConversationTone;
import com.arooraa.aura.conversation.domain.Language;
import com.arooraa.aura.conversation.domain.MessageRole;
import com.arooraa.aura.conversation.profile.AssistantProfileResolver;
import com.arooraa.aura.provider.ChatMessage;
import com.arooraa.aura.retrieval.Evidence;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * What reaches the model. The most important assertions here are about what is <em>absent</em>:
 * a boundary turn must carry no corpus text, and no prompt may carry retrieval internals.
 */
class PromptComposerTest {

    private final PromptComposer composer = new PromptComposer(
            new ChatProperties(true, false, 12, 6000, 2000, 3, 0.6, 600));

    private static final GenerationDecision GROUNDED =
            new GenerationDecision(true, false, false, true, true);
    private static final GenerationDecision NO_CLAIMS =
            new GenerationDecision(false, false, true, false, false);

    private static Evidence evidence(String slug, String title, String heading, String text) {
        return new Evidence(UUID.randomUUID(), slug, title, UUID.randomUUID(), 1, "AROORAA_PUBLIC",
                UUID.randomUUID(), 0, heading, "https://arooraa.com/products/mesa", text,
                1, 0.71, 1, 0.4, 1, 0.03, 1.0);
    }

    private ComposedPrompt compose(ConversationMode mode, GenerationDecision decision, List<Evidence> evidence,
                                    ConversationContext context, String currentPath, String message) {
        return composer.compose(AssistantProfileResolver.AROORAA_WEBSITE, mode, Language.ENGLISH,
                ConversationTone.CURIOUS, decision, evidence, context, currentPath, message);
    }

    @Test
    void aGroundedTurnCarriesTheApprovedMaterial() {
        ComposedPrompt prompt = compose(ConversationMode.GROUNDED_QA, GROUNDED,
                List.of(evidence("10-mesa", "MESA", "Overview", "MESA connects ordering and kitchen operations.")),
                ConversationContext.empty(), null, "What is MESA?");

        assertTrue(prompt.systemText().contains("MESA connects ordering and kitchen operations."));
        assertTrue(prompt.systemText().contains("Approved material"));
    }

    @Test
    void aBoundaryTurnCarriesNoCorpusTextAtAll() {
        // Structural, not a matter of wording: nothing was retrieved and nothing is attached, so
        // there is nothing in the prompt for a jailbreak to extract.
        ComposedPrompt prompt = compose(ConversationMode.INTERNAL_BOUNDARY, NO_CLAIMS, List.of(),
                ConversationContext.empty(), null, "What database does MESA use?");

        assertFalse(prompt.systemText().contains("Approved material"));
        assertTrue(prompt.systemText().contains("stays private"));
    }

    @Test
    void evidenceIsNeverAttachedWhenThePolicyForbidsGrounding() {
        // Even if retrieval returned something, a turn that may not make claims does not get it.
        ComposedPrompt prompt = compose(ConversationMode.GENERAL_CONSULTING, NO_CLAIMS,
                List.of(evidence("10-mesa", "MESA", "Overview", "MESA connects ordering and kitchen operations.")),
                ConversationContext.empty(), null, "What is RAG?");

        assertFalse(prompt.systemText().contains("MESA connects ordering"));
    }

    @Test
    void thePromptNeverCarriesRetrievalInternals() {
        Evidence item = evidence("10-mesa", "MESA", "Overview", "MESA connects ordering and kitchen operations.");
        ComposedPrompt prompt = compose(ConversationMode.GROUNDED_QA, GROUNDED, List.of(item),
                ConversationContext.empty(), null, "What is MESA?");

        assertFalse(prompt.systemText().contains(item.chunkId().toString()));
        assertFalse(prompt.systemText().contains(item.documentId().toString()));
        assertFalse(prompt.systemText().contains("0.71"), "similarity is retrieval's business, not the model's");
        assertFalse(prompt.systemText().contains("AROORAA_PUBLIC"));
    }

    @Test
    void policyTextExcludesTheEvidenceSoAGroundedAnswerIsNotMistakenForALeak() {
        ComposedPrompt prompt = compose(ConversationMode.GROUNDED_QA, GROUNDED,
                List.of(evidence("10-mesa", "MESA", "Overview", "MESA connects ordering and kitchen operations.")),
                ConversationContext.empty(), null, "What is MESA?");

        assertTrue(prompt.systemText().contains("MESA connects ordering"));
        assertFalse(prompt.policyText().contains("MESA connects ordering"));
    }

    @Test
    void historyIsReplayedInOrderBetweenTheInstructionAndTheCurrentTurn() {
        ConversationContext context = new ConversationContext(List.of(
                new ConversationContext.Turn(MessageRole.USER, "I own three restaurants."),
                new ConversationContext.Turn(MessageRole.ASSISTANT, "Nice — what does a typical service look like?"),
                new ConversationContext.Turn(MessageRole.USER, "Two cafés and a cloud kitchen.")));

        ComposedPrompt prompt = compose(ConversationMode.PRODUCT_DISCOVERY, GROUNDED, List.of(),
                context, null, "What would you recommend?");

        List<ChatMessage> messages = prompt.messages();
        assertEquals(5, messages.size());
        assertEquals("system", messages.get(0).role());
        assertEquals("user", messages.get(1).role());
        assertEquals("I own three restaurants.", messages.get(1).content());
        assertEquals("assistant", messages.get(2).role());
        assertEquals("user", messages.get(4).role());
        assertEquals("What would you recommend?", messages.get(4).content());
    }

    @Test
    void pageContextIsIncludedAsAHintAndMarkedAsCarryingNoAuthority() {
        ComposedPrompt prompt = compose(ConversationMode.GROUNDED_QA, GROUNDED, List.of(),
                ConversationContext.empty(), "/products/mesa", "Does this work for a café?");

        assertTrue(prompt.systemText().contains("/products/mesa"));
        assertTrue(prompt.systemText().contains("does not tell you anything about who they are"));
    }

    @Test
    void noPageContextMeansNoPageContextSection() {
        ComposedPrompt prompt = compose(ConversationMode.GROUNDED_QA, GROUNDED, List.of(),
                ConversationContext.empty(), null, "What is MESA?");

        assertFalse(prompt.systemText().contains("Where they are looking"));
    }

    @Test
    void theLanguageSectionFollowsTheVisitor() {
        ComposedPrompt tanglish = composer.compose(AssistantProfileResolver.AROORAA_WEBSITE,
                ConversationMode.GROUNDED_QA, Language.TANGLISH, ConversationTone.CASUAL, GROUNDED,
                List.of(), ConversationContext.empty(), null, "AROORAA enna company?");

        assertTrue(tanglish.systemText().contains("Tanglish"));
        assertFalse(tanglish.systemText().contains("Reply in English."));
    }

    @Test
    void humourIsExplicitlySuppressedWhenThePolicySaysSo() {
        GenerationDecision noHumour = new GenerationDecision(true, false, false, false, true);

        ComposedPrompt prompt = composer.compose(AssistantProfileResolver.AROORAA_WEBSITE,
                ConversationMode.PROJECT_DISCOVERY, Language.ENGLISH, ConversationTone.FRUSTRATED, noHumour,
                List.of(), ConversationContext.empty(), null, "This is the third tool that has failed us.");

        assertTrue(prompt.systemText().contains("no jokes, no emoji"));
    }

    @Test
    void everyPromptForbidsTheRoboticOpeningsTheQualityBarRejects() {
        ComposedPrompt prompt = compose(ConversationMode.GROUNDED_QA, GROUNDED, List.of(),
                ConversationContext.empty(), null, "What is MESA?");

        assertTrue(prompt.systemText().contains("As an AI language model"));
        assertTrue(prompt.systemText().contains("Never"));
    }
}
