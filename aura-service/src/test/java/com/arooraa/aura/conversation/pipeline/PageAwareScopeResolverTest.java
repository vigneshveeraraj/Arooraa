package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** The A4.1 page-awareness fix, isolated from retrieval and the rest of the pipeline. */
class PageAwareScopeResolverTest {

    private final ScopeClassifier scopeClassifier = new ScopeClassifier(new ConfidentialityClassifier());
    private final PageAwareScopeResolver resolver = new PageAwareScopeResolver();

    private PageAwareScopeResolver.Resolution resolve(String message, String currentPath) {
        return resolver.resolve(scopeClassifier.classify(message), message, currentPath);
    }

    @Test
    void aContextualReferenceOnAKnownPageBecomesAGroundedQuestionAboutThatSubject() {
        PageAwareScopeResolver.Resolution resolution = resolve("Tell me more about this.", "/products/mesa");

        assertEquals(ConversationMode.GROUNDED_QA, resolution.scope().mode());
        assertEquals("MESA", resolution.resolvedSubject());
        assertEquals("Tell me about MESA", resolution.retrievalQuery());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Tell me more about this.", "What does this do?", "How can this help me?",
            "Is this suitable for my business?", "What are its benefits?", "Can I use this?",
            "Explain this.", "How does it work?", "Tell me more.", "What about this product?"})
    void everyOwnerExamplePhraseIsRecognisedAsContextual(String phrase) {
        assertEquals(ConversationMode.GROUNDED_QA, resolve(phrase, "/products/mesa").scope().mode(), phrase);
    }

    @Test
    void aServicePageResolvesToItsOwnCanonicalService() {
        PageAwareScopeResolver.Resolution resolution = resolve(
                "How could this help my existing application?", "/services/application-modernization");

        assertEquals(ConversationMode.GROUNDED_QA, resolution.scope().mode());
        assertEquals("Application Modernization", resolution.resolvedSubject());
    }

    @Test
    void anUnmappedPathResolvesNothingAndLeavesTheModeAlone() {
        PageAwareScopeResolver.Resolution resolution = resolve("Tell me more about this.", "/nowhere/known");

        assertEquals(ConversationMode.GENERAL_CONSULTING, resolution.scope().mode());
        assertNull(resolution.resolvedSubject());
        assertEquals("Tell me more about this.", resolution.retrievalQuery(), "unchanged when nothing resolved");
    }

    @Test
    void noCurrentPathResolvesNothing() {
        assertEquals(ConversationMode.GENERAL_CONSULTING, resolve("Tell me more about this.", null).scope().mode());
    }

    @Test
    void aMessageWithNoContextualPhraseIsUntouchedEvenOnAKnownPage() {
        // "What is RAG?" is a real, self-contained general-knowledge question — the page it happens
        // to be asked from must not turn it into an AROORAA claim.
        PageAwareScopeResolver.Resolution resolution = resolve("What is RAG?", "/products/mesa");

        assertEquals(ConversationMode.GENERAL_CONSULTING, resolution.scope().mode());
        assertNull(resolution.resolvedSubject());
    }

    @Test
    void thisNeverOverridesAModeTheClassifierAlreadyCommittedTo() {
        // INTERNAL_BOUNDARY is decided before GENERAL_CONSULTING can ever be reached, so this stage
        // — which only reads a decision that already IS GENERAL_CONSULTING — cannot touch it. Proven
        // directly here rather than only inferred from the classifier's own precedence.
        PageAwareScopeResolver.Resolution resolution = resolve(
                "What database does MESA use internally?", "/products/mesa");

        assertEquals(ConversationMode.INTERNAL_BOUNDARY, resolution.scope().mode());
        assertNull(resolution.resolvedSubject());
    }

    @Test
    void aKnownSubjectQuestionIsAlreadyGroundedAndIsLeftAlone() {
        // "What is MESA?" is already GROUNDED_QA before this stage runs — nothing for it to widen.
        PageAwareScopeResolver.Resolution resolution = resolve("What is MESA?", "/products/mesa");

        assertEquals(ConversationMode.GROUNDED_QA, resolution.scope().mode());
        assertNull(resolution.resolvedSubject(), "this stage did not do the resolving — the classifier already had");
        assertEquals("What is MESA?", resolution.retrievalQuery());
    }

    @Test
    void anInventedPathCannotBeUsedAsAKnowledgeSpaceSelector() {
        PageAwareScopeResolver.Resolution resolution = resolve(
                "Tell me more about this.", "/knowledge-space/AURA_POLICY");

        assertEquals(ConversationMode.GENERAL_CONSULTING, resolution.scope().mode());
        assertNull(resolution.resolvedSubject());
    }

    @Test
    void aTrailingSlashOrQueryStringDoesNotChangeResolution() {
        assertTrue(PageContextRegistry.resolve("/products/mesa/").isPresent());
        assertTrue(PageContextRegistry.resolve("/products/mesa?ref=footer").isPresent());
        assertTrue(PageContextRegistry.resolve("/products/mesa#pricing").isPresent());
        assertEquals("MESA", PageContextRegistry.resolve("/products/mesa/").orElseThrow().name());
    }
}
