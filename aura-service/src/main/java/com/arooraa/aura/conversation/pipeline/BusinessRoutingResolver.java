package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.ResponseAction;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Pipeline stage 3.7 (A1.5). Asks the one question the router never asked: is this person trying
 * to <em>learn</em> something, or trying to <em>build</em> something?
 *
 * <h2>Why this exists</h2>
 * A visitor asked "can you help me to guide how to code?" and Aura answered with a competent
 * beginner's tutorial and the names of three external learning platforms. Every stage behaved
 * correctly. {@link ScopeClassifier} matched no phrase in any of its lists, so the message fell
 * through to {@link ConversationMode#GENERAL_CONSULTING}, the catch-all; that mode's prompt says
 * "this is consulting, not a referral back to us"; and the no-evidence rule adds that general
 * knowledge is fully available. Given those three instructions the answer Aura produced is the
 * correct one. The defect is that nobody had established what the person wanted.
 *
 * <p>That question cannot be answered by more prose in a prompt, because the two readings lead to
 * genuinely different conversations — one is a student who deserves help learning, the other is
 * someone who may need an application built and is being handed a tutorial instead. So it is
 * decided here, deterministically, before the model is asked to say anything.
 *
 * <h2>What it is allowed to touch</h2>
 * Only the catch-all. Like {@link PageAwareScopeResolver}, this stage narrows a fallback and never
 * overrides a decision made on real evidence: it runs after the confidentiality classifier and
 * cannot reach {@link ConversationMode#INTERNAL_BOUNDARY}, {@link ConversationMode#CAREERS},
 * {@link ConversationMode#GROUNDED_QA} or anything else the classifier decided deliberately. A
 * confidentiality probe phrased as a build question is still a confidentiality probe.
 */
@Component
public class BusinessRoutingResolver {

    /**
     * Saying, in so many words, that the point is to learn it themselves. Explicit purpose, so it
     * is checked before the building signals: "I want to learn how to build an app" is a student,
     * and "I want to build an app" is not.
     */
    private static final List<String> LEARNING = List.of(
            "learn", "learning", "learnt", "study", "studying", "student", "college", "university",
            "beginner", "beginners", "teach me", "tutorial", "tutorials", "course", "courses",
            "practice", "practise", "exercises", "syllabus", "curriculum", "self taught",
            "kathukanum", "padikanum", "kathukka");

    /**
     * Saying that something should exist that does not exist yet. Deliberately includes the plain
     * business phrasings, because the people who most need routing here are the ones who describe
     * a problem rather than a technology — "our stock count is done on paper" is a project.
     */
    private static final List<String> BUILDING = List.of(
            "build", "building", "create", "creating", "develop", "developing", "make me",
            "need an app", "need a website", "need an application", "need a system", "need a platform",
            "want an app", "want a website", "want an application", "want a system",
            "ecommerce", "e commerce", "online store", "mobile app", "web app", "portal",
            "ai system", "ai tool", "ai solution", "ai platform",
            "for my business", "for my company", "for my restaurant", "for my shop", "for my team",
            "our business", "our company", "our team", "our customers", "our staff", "our warehouse",
            "we need", "we want", "automate", "automation", "integrate", "integration",
            "manual process", "manually", "by hand", "on paper", "spreadsheet", "spreadsheets",
            "takes too long", "too slow", "inefficient", "bottleneck",
            "launch", "go live", "roll out", "migrate", "modernize", "modernise", "scale",
            // A1.5 follow-up: an operator naming what they run is already a strong enough signal on
            // its own — "I run three restaurants and need better billing" names no technology and no
            // AROORAA product, so nothing above matched it, and it fell through to plain consulting
            // about a problem that is exactly what MESA exists for.
            "run a restaurant", "run restaurants", "run my restaurant", "own a restaurant",
            "own restaurants", "three restaurants", "multiple restaurants", "several restaurants",
            "my restaurant", "my restaurants");

    /**
     * The craft itself, named with no object attached. This is the shape that is genuinely
     * ambiguous — "how do I code" tells you nothing about why — and it is the only shape that
     * earns a clarifying question. A message naming something concrete has already answered it.
     */
    private static final List<String> CRAFT_WITHOUT_AN_OBJECT = List.of(
            "code", "coding", "program", "programming", "programme", "software development",
            "web development", "app development", "developer", "development",
            "java", "python", "javascript", "react", "html", "css", "sql",
            "get started", "getting started", "where do i start", "how do i start");

    /**
     * @param mode    the mode the classifier decided
     * @param message the visitor's words, already canonicalised
     * @return what this turn should do, and the mode it should do it in
     */
    public Routing resolve(ConversationMode mode, String message) {
        // Only the two "nothing was matched" outcomes are eligible. Everything else was decided on
        // a signal, and this stage has nothing better to go on than the stage that decided it.
        if (mode != ConversationMode.GENERAL_CONSULTING && mode != ConversationMode.OUT_OF_SCOPE) {
            return new Routing(mode, actionFor(mode));
        }

        String text = TextSignals.normalize(message);
        boolean learning = TextSignals.containsAny(text, LEARNING);
        boolean building = TextSignals.containsAny(text, BUILDING);

        // Both at once means they said the learning part out loud, and that is the more specific
        // claim: somebody learning to build something is still learning.
        if (learning) {
            return new Routing(ConversationMode.GENERAL_CONSULTING, ResponseAction.CONSULT);
        }
        if (building) {
            return new Routing(ConversationMode.PROJECT_DISCOVERY, ResponseAction.DISCOVER);
        }
        if (TextSignals.containsAny(text, CRAFT_WITHOUT_AN_OBJECT)) {
            return new Routing(ConversationMode.GENERAL_CONSULTING, ResponseAction.CLARIFY);
        }
        return new Routing(mode, ResponseAction.ANSWER);
    }

    /**
     * What a mode decided elsewhere already implies about the shape of the turn.
     *
     * <p>Without this, the same intent got two different actions depending on which stage happened
     * to catch it: "we need to modernize our platform" matched the classifier's own discovery list
     * and came out as ANSWER, while the same sentence phrased slightly differently fell through to
     * here and came out as DISCOVER. The action describes the turn, so it cannot depend on who
     * noticed first.
     */
    private static ResponseAction actionFor(ConversationMode mode) {
        return switch (mode) {
            case PROJECT_DISCOVERY, PRODUCT_DISCOVERY -> ResponseAction.DISCOVER;
            default -> ResponseAction.ANSWER;
        };
    }

    /**
     * @param mode   the mode the rest of the pipeline should use
     * @param action what this turn should do
     */
    public record Routing(ConversationMode mode, ResponseAction action) {
    }
}
