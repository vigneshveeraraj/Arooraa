package com.arooraa.aura.knowledge.domain;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** The rule that decides whether a section of a public document is public. */
class SectionEligibilityTest {

    private static final String MARKER = "<!-- retrievable: false — guidance for Aura, not an answer -->";

    @Test
    void anExplicitMarkerExcludesTheSection() {
        assertFalse(SectionEligibility.isRetrievable("Anything at all", MARKER + "\n\nSome body text."));
    }

    @Test
    void aSectionWithoutAMarkerOrAControlHeadingIsOrdinaryKnowledge() {
        assertTrue(SectionEligibility.isRetrievable("What MESA does today",
                "Digital Dining, Kitchen Coordination, Staff Operations."));
        assertTrue(SectionEligibility.isRetrievable(null, "A document preamble with no heading."));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "What Aura must not disclose about MESA",
            "What Aura must never disclose about AROORAA itself",
            "Aura's role in this flow",
            "What Aura must not do here",
            "Aura should never say",
            "What Aura is allowed to discuss",
            "Confidentiality instructions",
            "Internal guidance for answering",
            "Assistant instructions",
            "Guardrail rules"})
    void aHeadingThatInstructsTheAssistantIsExcludedEvenWithoutAMarker(String heading) {
        // The backstop, for content written before the marker existed. The marker is still the
        // mechanism — a heading can be reworded, and this must not be the only thing standing
        // between a confidentiality instruction and a visitor.
        assertFalse(SectionEligibility.isRetrievable(heading, "Body text."), heading);
        assertTrue(SectionEligibility.isAssistantControlHeading(heading), heading);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "What MESA does today",
            "The problem it addresses",
            "Engineering approach",
            "Status and direction",
            "Who it's for",
            "How to apply",
            "Trust",
            "Why AROORAA exists",
            "The kinds of engagement a project can become"})
    void realVisitorFacingHeadingsAreNotMistakenForInstructions(String heading) {
        // The backstop has to be narrow enough that no genuine public heading trips it — a false
        // positive silently removes real knowledge from the corpus.
        assertFalse(SectionEligibility.isAssistantControlHeading(heading), heading);
    }

    @Test
    void mentioningAuraIsNotEnoughOnItsOwn() {
        // "Aura" appears in perfectly ordinary public copy. Only a heading that gives Aura an
        // instruction is control text.
        assertFalse(SectionEligibility.isAssistantControlHeading("Meet Aura"));
        assertFalse(SectionEligibility.isAssistantControlHeading("Aura, the digital representative"));
    }

    @Test
    void editorialCommentsAreStrippedFromText() {
        String text = "Credibility comes from the work itself.\n\n"
                + "<!-- NEEDS_OWNER_APPROVAL: exact founding year is not stated in public content. -->";

        String cleaned = SectionEligibility.stripEditorialMarkup(text).strip();

        assertEquals("Credibility comes from the work itself.", cleaned);
        assertFalse(cleaned.contains("NEEDS_OWNER_APPROVAL"));
    }

    @Test
    void strippingHandlesAMultiLineCommentAndLeavesTheRestAlone() {
        String text = "Before.\n<!-- a note\nthat spans\nthree lines -->\nAfter.";

        assertEquals("Before.\n\nAfter.", SectionEligibility.stripEditorialMarkup(text));
    }

    @Test
    void aCrossReferenceBetweenSeedFilesIsNotContent() {
        // Verbatim from knowledge-seed/32-security-by-design.md, a PUBLIC document. The sentence is
        // genuinely public; the pointer to a policy file inside it is an editor's note, and it puts
        // an internal document's name into text a visitor could be shown.
        String text = "This is the same discipline behind Aura's own confidentiality boundary "
                + "(`91-aura-confidentiality-and-safety.md`).";

        String cleaned = SectionEligibility.stripEditorialMarkup(text);

        assertEquals("This is the same discipline behind Aura's own confidentiality boundary.", cleaned);
    }

    @Test
    void aBareSeedReferenceIsRemovedToo() {
        String cleaned = SectionEligibility.stripEditorialMarkup(
                "See `95-aura-unknown-answer-policy.md` for the rule.").strip();

        assertFalse(cleaned.contains("95-aura-unknown-answer-policy"));
        assertTrue(cleaned.startsWith("See"), cleaned);
    }

    @Test
    void ordinaryProseWithBracketsAndCodeIsLeftAlone() {
        String text = "Multi-tenant SaaS (one connected environment per restaurant), API-first.";

        assertEquals(text, SectionEligibility.stripEditorialMarkup(text));
    }
}
