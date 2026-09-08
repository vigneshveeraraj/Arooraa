package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.config.ChatProperties;
import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.Language;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The last check before a visitor sees anything. Security failures must be blocked outright;
 * quality failures must be repaired without discarding a useful answer.
 */
class OutputGuardrailTest {

    private static final String POLICY_TEXT = """
            ## What stays private
            AROORAA's own internal implementation is private. That includes which databases,
            frameworks, languages, models, servers, infrastructure, source code, schemas,
            credentials or internal architecture anything of ours runs on.
            """;

    private final OutputGuardrail guardrail = new OutputGuardrail(
            new ChatProperties(true, false, 12, 6000, 400, 3, 0.6, 600));

    private static final GenerationDecision GROUNDED =
            new GenerationDecision(true, false, false, true, true, false);
    private static final GenerationDecision NO_CLAIMS =
            new GenerationDecision(false, false, true, false, false, false);

    @Test
    void anOrdinaryAnswerPassesUntouched() {
        String answer = "MESA connects ordering, kitchen and staff operations into one system.";

        GuardrailResult result = guardrail.check(answer, POLICY_TEXT, ConversationMode.GROUNDED_QA,
                Language.ENGLISH, GROUNDED);

        assertTrue(result.passed());
        assertEquals(answer, result.text());
    }

    // --- Security failures: blocked -----------------------------------------------------------

    @ParameterizedTest
    @ValueSource(strings = {
            "Sure — the key is sk-abcdefghijklmnopqrstuvwxyz123456.",
            "Use AKIAIOSFODNN7EXAMPLE for access.",
            "Connect with postgres://user:pw@db.internal:5432/arooraa",
            "The password: hunter2seventeen works.",
            "The server is at 203.0.113.42.",
            "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9abcdef"})
    void anythingThatLooksLikeSecretMaterialIsBlocked(String answer) {
        GuardrailResult result = guardrail.check(answer, POLICY_TEXT, ConversationMode.GENERAL_CONSULTING,
                Language.ENGLISH, GROUNDED);

        assertTrue(result.replaced(), answer);
        assertEquals(GuardrailResult.SECRET_MATERIAL, result.violationCode(), answer);
    }

    @Test
    void repeatingTheInstructionsBackIsBlocked() {
        // Not a phrase blacklist — a verbatim run of words from the actual instruction text, so a
        // leak of wording nobody anticipated is caught just as well.
        String leak = "My instructions say: AROORAA's own internal implementation is private. "
                + "That includes which databases, frameworks, languages, models, servers.";

        GuardrailResult result = guardrail.check(leak, POLICY_TEXT, ConversationMode.INTERNAL_BOUNDARY,
                Language.ENGLISH, NO_CLAIMS);

        assertTrue(result.replaced());
        assertEquals(GuardrailResult.PROMPT_LEAKAGE, result.violationCode());
    }

    @Test
    void aTurnForbiddenFromArooraaClaimsCannotAssertOurStack() {
        // The exact failure the general-knowledge rule exists to prevent: general model knowledge
        // ("caching is useful") quietly becoming an AROORAA fact ("AROORAA uses Redis").
        GuardrailResult result = guardrail.check("AROORAA uses Redis internally for caching.", POLICY_TEXT,
                ConversationMode.GENERAL_CONSULTING, Language.ENGLISH, NO_CLAIMS);

        assertTrue(result.replaced());
        assertEquals(GuardrailResult.UNSUPPORTED_CLAIM, result.violationCode());
    }

    @Test
    void discussingATechnologyForTheVisitorsSystemIsNotAClaimAboutUs() {
        String answer = "For your booking system, Postgres would handle that load comfortably — "
                + "you could add caching later if reads become the bottleneck.";

        GuardrailResult result = guardrail.check(answer, POLICY_TEXT, ConversationMode.GENERAL_CONSULTING,
                Language.ENGLISH, NO_CLAIMS);

        assertTrue(result.passed());
    }

    @Test
    void aGroundedAnswerMayNameATechnologyOurPublicMaterialDiscloses() {
        // Mindra's stack is public on arooraa.com. The claim check only runs where no AROORAA claim
        // is permitted at all, so a grounded answer is never second-guessed by it.
        String answer = "Mindra is built as a real mobile product — React Native on the front, Spring Boot behind it.";

        GuardrailResult result = guardrail.check(answer, POLICY_TEXT, ConversationMode.GROUNDED_QA,
                Language.ENGLISH, GROUNDED);

        assertTrue(result.passed());
    }

    // --- Quality failures: repaired -----------------------------------------------------------

    @Test
    void roboticPhrasingIsStrippedRatherThanDiscardingTheAnswer() {
        GuardrailResult result = guardrail.check(
                "According to the provided context, MESA coordinates kitchen and floor staff.",
                POLICY_TEXT, ConversationMode.GROUNDED_QA, Language.ENGLISH, GROUNDED);

        assertFalse(result.replaced());
        assertEquals(GuardrailResult.ROBOTIC_PHRASING, result.violationCode());
        assertEquals("MESA coordinates kitchen and floor staff.", result.text());
    }

    @Test
    void anOverlongAnswerIsTrimmedAtASentenceBoundary() {
        String longAnswer = ("MESA coordinates kitchen and floor operations. ").repeat(20);

        GuardrailResult result = guardrail.check(longAnswer, POLICY_TEXT, ConversationMode.GROUNDED_QA,
                Language.ENGLISH, GROUNDED);

        assertEquals(GuardrailResult.EXCESSIVE_LENGTH, result.violationCode());
        assertFalse(result.replaced(), "trimming keeps the answer; it does not throw it away");
        assertTrue(result.text().length() <= 400);
        assertTrue(result.text().endsWith("."), "a trimmed answer should still read as finished");
    }

    @Test
    void aBlockedBoundaryTurnFallsBackToSomethingAuraWouldActuallySay() {
        GuardrailResult result = guardrail.check("sk-abcdefghijklmnopqrstuvwxyz123456", POLICY_TEXT,
                ConversationMode.INTERNAL_BOUNDARY, Language.ENGLISH, NO_CLAIMS);

        assertTrue(result.replaced());
        assertFalse(result.text().toLowerCase().contains("error"));
        assertFalse(result.text().toLowerCase().contains("cannot process"));
        assertTrue(result.text().length() > 20);
    }

    @Test
    void theFallbackFollowsTheVisitorsLanguage() {
        GuardrailResult tanglish = guardrail.check("sk-abcdefghijklmnopqrstuvwxyz123456", POLICY_TEXT,
                ConversationMode.INTERNAL_BOUNDARY, Language.TANGLISH, NO_CLAIMS);

        assertTrue(tanglish.replaced());
        assertTrue(tanglish.text().contains("unga") || tanglish.text().contains("naan"),
                "a Tanglish conversation should not fall back into English");
    }

    @Test
    void anEmptyGenerationIsTreatedAsAFailureRatherThanAnEmptyAnswer() {
        GuardrailResult result = guardrail.check("  ", POLICY_TEXT, ConversationMode.GROUNDED_QA,
                Language.ENGLISH, GROUNDED);

        assertTrue(result.replaced());
        assertFalse(result.text().isBlank());
    }
}
