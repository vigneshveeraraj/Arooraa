package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Pipeline stage 3. Routes a turn to a {@link ConversationMode}, which decides whether retrieval
 * runs, what the model is told it may claim, and whether sources are shown.
 *
 * <p>Deterministic, like the confidentiality classifier it defers to, and for a related reason: a
 * misrouted turn changes what Aura is allowed to say, so the routing needs to be inspectable and
 * testable rather than an opaque model judgement. The cost is the usual keyword-classifier
 * bluntness; the mitigation is that no mode can widen the retrieval boundary — the worst a
 * misroute does is make Aura answer in a less useful register, never in a less safe one.
 *
 * <p>Order matters and encodes precedence: confidentiality outranks everything, then the specific
 * intents, then the general fallbacks. A message that is both an idea and a product question
 * ("I run a café — can MESA help?") lands on the more actionable of the two.
 */
@Component
public class ScopeClassifier {

    private static final List<String> ORGANISATION_SUBJECTS = List.of(
            "arooraa", "aura", "mesa", "mindra", "smart mirror", "smart home", "smarthome");

    private static final List<String> CAREERS = List.of(
            "job", "jobs", "career", "careers", "hiring", "hire me", "vacancy", "vacancies",
            "internship", "intern", "apply", "application for", "resume", "cv", "recruitment",
            "work with you", "work at", "join your team", "opening", "openings");

    /** Tanglish/Tamil included: a visitor describing an idea rarely switches to English to do it. */
    private static final List<String> PROJECT_DISCOVERY = List.of(
            "i have an idea", "app idea", "product idea", "software idea", "business idea",
            "crazy idea", "startup idea", "i want to build", "i want to develop", "i need an app",
            "i need a website", "we want to build", "we need an app", "want to create",
            "planning to build", "thinking of building", "idea iruku", "idea irukku",
            "build panna", "develop panna", "develop pannanum", "pannanum", "venum",
            "frustrated with my", "unhappy with my", "problems with my", "my current software",
            "existing application", "existing software", "modernize", "modernise");

    private static final List<String> PRODUCT_SITUATION = List.of(
            "my restaurant", "my restaurants", "my cafe", "my cafes", "my hotel", "my business",
            "my shop", "my store", "my kitchen", "i own", "i run", "we run", "restaurant ku",
            "restaurantku", "hotel ku", "for my", "help me", "suit me", "for us");

    private static final List<String> NAVIGATION = List.of(
            "where can i find", "where do i find", "which page", "what page", "link", "url",
            "show me the page", "contact page", "how do i contact", "how can i contact",
            "get in touch", "reach you", "email address", "phone number", "start project",
            "where is the");

    /** General world information Aura is not here for. */
    private static final List<String> OUT_OF_SCOPE = List.of(
            "weather", "temperature outside", "world cup", "football", "cricket score", "cricket match",
            "capital of", "who won", "election", "stock price", "share price", "horoscope",
            "recipe", "movie", "song lyrics", "write my essay", "write an essay", "my homework",
            "homework", "write a poem", "poem about", "joke about", "translate this into",
            "medicine", "fever", "symptoms", "news today", "latest news", "who is the president");

    private final ConfidentialityClassifier confidentialityClassifier;

    public ScopeClassifier(ConfidentialityClassifier confidentialityClassifier) {
        this.confidentialityClassifier = confidentialityClassifier;
    }

    public ScopeDecision classify(String message) {
        String text = TextSignals.normalize(message);

        ConfidentialityVerdict verdict = confidentialityClassifier.classify(message);
        if (verdict.internalBoundary()) {
            return new ScopeDecision(ConversationMode.INTERNAL_BOUNDARY, verdict);
        }
        if (TextSignals.containsAny(text, CAREERS)) {
            return new ScopeDecision(ConversationMode.CAREERS, verdict);
        }
        boolean aboutArooraa = TextSignals.containsAny(text, ORGANISATION_SUBJECTS);
        if (aboutArooraa && TextSignals.containsAny(text, PRODUCT_SITUATION)) {
            return new ScopeDecision(ConversationMode.PRODUCT_DISCOVERY, verdict);
        }
        // Checked before project discovery so "can AROORAA modernize an existing application?"
        // stays a question about AROORAA's capability, while "I want to modernize my existing
        // application" — same verb, visitor's system — becomes discovery below.
        if (aboutArooraa) {
            return new ScopeDecision(ConversationMode.GROUNDED_QA, verdict);
        }
        if (TextSignals.containsAny(text, PROJECT_DISCOVERY)) {
            return new ScopeDecision(ConversationMode.PROJECT_DISCOVERY, verdict);
        }
        if (TextSignals.containsAny(text, NAVIGATION)) {
            return new ScopeDecision(ConversationMode.NAVIGATION, verdict);
        }
        if (TextSignals.containsAny(text, OUT_OF_SCOPE)) {
            return new ScopeDecision(ConversationMode.OUT_OF_SCOPE, verdict);
        }
        return new ScopeDecision(ConversationMode.GENERAL_CONSULTING, verdict);
    }
}
