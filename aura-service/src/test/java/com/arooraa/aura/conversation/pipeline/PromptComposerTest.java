package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.config.ChatProperties;
import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.ConversationTone;
import com.arooraa.aura.conversation.domain.Language;
import com.arooraa.aura.conversation.domain.MessageRole;
import com.arooraa.aura.conversation.domain.ResponseAction;
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
            new GenerationDecision(true, false, false, true, true, false);
    private static final GenerationDecision NO_CLAIMS =
            new GenerationDecision(false, false, true, false, false, false);

    private static Evidence evidence(String slug, String title, String heading, String text) {
        return new Evidence(UUID.randomUUID(), slug, title, UUID.randomUUID(), 1, "AROORAA_PUBLIC",
                UUID.randomUUID(), 0, heading, "https://arooraa.com/products/mesa", text,
                1, 0.71, 1, 0.4, 1, 0.03, 1.0);
    }

    private ComposedPrompt compose(ConversationMode mode, GenerationDecision decision, List<Evidence> evidence,
                                    ConversationContext context, String currentPath, String message) {
        return composer.compose(AssistantProfileResolver.AROORAA_WEBSITE, mode, Language.ENGLISH,
                ConversationTone.CURIOUS, decision, evidence, context, currentPath, message, List.of(),
                ResponseAction.ANSWER);
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
                List.of(), ConversationContext.empty(), null, "AROORAA enna company?", List.of(), ResponseAction.ANSWER);

        assertTrue(tanglish.systemText().contains("Tanglish"));
        assertFalse(tanglish.systemText().contains("Reply in English."));
    }

    @Test
    void humourIsExplicitlySuppressedWhenThePolicySaysSo() {
        GenerationDecision noHumour = new GenerationDecision(true, false, false, false, true, false);

        ComposedPrompt prompt = composer.compose(AssistantProfileResolver.AROORAA_WEBSITE,
                ConversationMode.PROJECT_DISCOVERY, Language.ENGLISH, ConversationTone.FRUSTRATED, noHumour,
                List.of(), ConversationContext.empty(), null, "This is the third tool that has failed us.", List.of(),
                ResponseAction.ANSWER);

        assertTrue(prompt.systemText().contains("no jokes, no emoji"));
    }

    @Test
    void aGreetingIsToldToSayHelloRatherThanToReportHavingNoInformation() {
        // The generic "no approved information" wording is right for an unanswerable question and
        // absurd in reply to "hi", so SOCIAL gets its own claim rule.
        ComposedPrompt prompt = compose(ConversationMode.SOCIAL, NO_CLAIMS, List.of(),
                ConversationContext.empty(), null, "Hi Aura");

        assertFalse(prompt.systemText().contains("Approved material"));
        assertFalse(prompt.systemText().contains("you do not have approved information"));
        assertTrue(prompt.systemText().contains("This is small talk"));
        assertTrue(prompt.systemText().contains("nothing to claim"));
    }

    @Test
    void aJokeIsAllowedOnceAndNotAsARoutine() {
        // Controlled light humour is part of the personality; being an entertainment bot is not.
        ComposedPrompt prompt = compose(ConversationMode.SOCIAL, NO_CLAIMS, List.of(),
                ConversationContext.empty(), null, "tell me a joke");

        assertTrue(prompt.systemText().contains("If they ask for a joke, tell them one"));
        assertTrue(prompt.systemText().contains("One is the right number"),
                "the limit has to travel with the permission");
    }

    @Test
    void aFirstQuestionIsToldToAnswerShortRatherThanExhaustively() {
        ComposedPrompt prompt = compose(ConversationMode.GROUNDED_QA, GROUNDED,
                List.of(evidence("10-mesa", "MESA", "Overview", "MESA connects ordering and kitchen operations.")),
                ConversationContext.empty(), null, "What is MESA?");

        assertTrue(prompt.systemText().contains("Short by default"));
        assertTrue(prompt.systemText().contains("one or two short paragraphs is the whole"));
        assertTrue(prompt.systemText().contains("to be accurate, not to be"),
                "the evidence being long is not a reason for the answer to be");
        assertTrue(prompt.systemText().contains("feel free to ask"),
                "and the stock closing line is named as something to avoid");
    }

    @Test
    void everyPromptForbidsTheRoboticOpeningsTheQualityBarRejects() {
        ComposedPrompt prompt = compose(ConversationMode.GROUNDED_QA, GROUNDED, List.of(),
                ConversationContext.empty(), null, "What is MESA?");

        assertTrue(prompt.systemText().contains("As an AI language model"));
        assertTrue(prompt.systemText().contains("Never"));
    }

    // --- A5.2.4: the subject is ours, so the world's other meaning is not available ---------------

    private ComposedPrompt composeAbout(List<String> entities, ConversationMode mode,
                                         GenerationDecision decision, List<Evidence> evidence) {
        return composer.compose(AssistantProfileResolver.AROORAA_WEBSITE, mode, Language.ENGLISH,
                ConversationTone.CURIOUS, decision, evidence, ConversationContext.empty(), null,
                "mesa uses?", entities, ResponseAction.ANSWER);
    }

    @Test
    void aRecognisedSubjectIsNamedBeforeTheClaimRulesRatherThanAfterThem() {
        ComposedPrompt prompt = composeAbout(List.of("MESA"), ConversationMode.GROUNDED_QA, GROUNDED, List.of());

        String text = prompt.systemText();
        assertTrue(text.contains("What they are asking about"), text);
        assertTrue(text.indexOf("What they are asking about") < text.indexOf("What you may claim"),
                "the turn should know its subject before it is told what it may say about it");
    }

    @Test
    void noSubjectMeansNoSubjectSection() {
        ComposedPrompt prompt = composeAbout(List.of(), ConversationMode.GROUNDED_QA, GROUNDED, List.of());

        assertFalse(prompt.systemText().contains("What they are asking about"));
    }

    /**
     * The A5.2.4 defect in one assertion. "mesa uses?" retrieved nothing, and the no-evidence rule
     * told the model that general engineering knowledge was fully available — so it answered about
     * the open-source graphics library, obeying every instruction it had been given. When the
     * subject is one of ours, that latitude is withdrawn.
     */
    @Test
    void anEmptySearchForOneOfOurOwnProductsLeavesNoGeneralWorldAnswerToFallBackOn() {
        ComposedPrompt prompt = composeAbout(List.of("MESA"), ConversationMode.GROUNDED_QA, NO_CLAIMS, List.of());

        String text = prompt.systemText();
        assertFalse(text.contains("General engineering knowledge"),
                "this is the sentence the model followed into the graphics library");
        assertTrue(text.contains("general knowledge does not stand"), text);
        assertTrue(text.contains("the world that shares its name"), text);
        assertTrue(text.contains("do not have approved information about it yet"),
                "the honest answer must still be offered");
    }

    @Test
    void aTurnWithNoSubjectOfOursKeepsItsGeneralKnowledge() {
        // The withdrawal above is scoped to our own names. A visitor asking about their own stack
        // still gets an assistant that knows things.
        ComposedPrompt prompt = composeAbout(List.of(), ConversationMode.GENERAL_CONSULTING, NO_CLAIMS, List.of());

        assertTrue(prompt.systemText().contains("General engineering knowledge"));
    }

    @Test
    void namingTheSubjectGrantsNoGroundingOfItsOwn() {
        // The subject section states what the question is about and nothing about what may be
        // claimed: no evidence means no evidence, recognised name or not.
        ComposedPrompt prompt = composeAbout(List.of("MESA"), ConversationMode.GROUNDED_QA, NO_CLAIMS,
                List.of(evidence("10-mesa", "MESA", "Overview", "MESA connects ordering and kitchen.")));

        assertFalse(prompt.systemText().contains("Approved material"),
                "a no-claims turn is given no corpus text however well we know the subject");
    }

    // --- A1.5 follow-up: commercial authority --------------------------------------------------

    @Test
    void everyTurnCarriesTheCommercialAuthorityBoundary() {
        // Unlike routing/externalReferences, nothing decides in advance whether a turn is going to
        // ask "how much will this cost?" — it can arrive from any mode — so unlike those two this
        // has to be present unconditionally, not only when some upstream stage predicted it.
        ComposedPrompt onATrivialQuestion = compose(ConversationMode.SOCIAL, NO_CLAIMS, List.of(),
                ConversationContext.empty(), null, "hey aura");
        ComposedPrompt onADiscoveryTurn = compose(ConversationMode.PROJECT_DISCOVERY, NO_CLAIMS, List.of(),
                ConversationContext.empty(), null, "How much will my application cost?");

        for (ComposedPrompt prompt : List.of(onATrivialQuestion, onADiscoveryTurn)) {
            String text = prompt.systemText();
            assertTrue(text.contains("quote a price"), text);
            assertTrue(text.contains("confirmation from our team"), text);
        }
    }
}
