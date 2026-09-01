package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
 * <p>Order matters and encodes precedence: confidentiality outranks everything, then a message that
 * is <em>only</em> a greeting, then the specific intents, then the general fallbacks. A message that
 * is both an idea and a product question ("I run a café — can MESA help?") lands on the more
 * actionable of the two.
 */
@Component
public class ScopeClassifier {

    private static final List<String> ORGANISATION_SUBJECTS = List.of(
            "arooraa", "aura", "mesa", "mindra", "smart mirror", "smart home", "smarthome");

    /** Longest a message can be and still plausibly be nothing but hello. */
    private static final int MAX_SOCIAL_TOKENS = 6;

    /** A word that makes a message a greeting. At least one of these has to be present. */
    private static final Set<String> GREETING_WORDS = normalizedTokens(
            "hi", "hii", "hiii", "hey", "heyy", "heyyy", "hello", "helo", "hallo", "hai", "hiya",
            "yo", "howdy", "hola", "greetings", "welcome", "sup",
            "morning", "afternoon", "evening", "night",
            "vanakkam", "vanakam", "வணக்கம்", "namaste", "namaskaram");

    /**
     * Words that can surround a greeting without turning it into a question. Nothing here carries
     * any topic of its own — that is the whole point, and why the list stays this short.
     */
    private static final Set<String> GREETING_PADDING = normalizedTokens(
            "good", "very", "there", "again", "aura", "arooraa", "team", "everyone", "all",
            "bro", "bruh", "buddy", "friend", "dude", "machan", "macha", "da", "boss",
            "sir", "madam", "mam", "maam", "anna", "akka",
            "how", "are", "you", "u", "r", "doing",
            // "vanakkam epdi irukinga?" is one greeting, not a greeting plus a question.
            "epdi", "eppadi", "iruka", "irukinga", "irukkinga", "irukeenga", "nalla");

    /** Whole openers that carry no greeting word of their own but are still just an opener. */
    private static final Set<String> STANDALONE_SOCIAL = normalizedPhrases(
            "how are you", "how are you doing", "how r u", "how are u", "how's it going",
            "hows it going", "epdi irukinga", "eppadi irukkinga", "epdi iruka",
            "nalla irukingala", "sowkiyama");

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
        // Before the organisation-subject rule below, which is what used to swallow "Hey Aura" —
        // and after confidentiality, which outranks everything including a friendly opening.
        if (isSocialOpener(text)) {
            return new ScopeDecision(ConversationMode.SOCIAL, verdict);
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

    /**
     * True when the <em>whole</em> message is a greeting or a social opener.
     *
     * <p>Every token has to be a greeting or greeting padding — one unrecognised word and this is a
     * message with a topic, not an opener. That is what keeps "Hey Aura, what is MESA?" a question
     * about MESA while "Hey Aura" is just hello, and it is why this is a closed allow-list rather
     * than a "starts with hi" prefix check: the failure mode to avoid is a real question slipping
     * into a mode that answers without looking anything up.
     */
    private boolean isSocialOpener(String normalized) {
        String trimmed = normalized.trim();
        if (trimmed.isEmpty()) {
            return false;
        }
        if (STANDALONE_SOCIAL.contains(trimmed)) {
            return true;
        }
        String[] tokens = trimmed.split("\\s+");
        if (tokens.length > MAX_SOCIAL_TOKENS) {
            return false;
        }
        boolean greetingPresent = false;
        for (String token : tokens) {
            boolean greeting = GREETING_WORDS.contains(token);
            if (!greeting && !GREETING_PADDING.contains(token)) {
                return false;
            }
            greetingPresent |= greeting;
        }
        return greetingPresent;
    }

    /**
     * Terms are written here the way a person writes them and normalized once, through the same
     * {@link TextSignals#normalize} a visitor's message goes through. That matters for Tamil:
     * normalization strips combining marks, so the literal "வணக்கம்" and the form a real message
     * arrives as are guaranteed to agree without anyone hand-typing the stripped spelling.
     */
    private static Set<String> normalizedTokens(String... terms) {
        return Arrays.stream(terms)
                .map(term -> TextSignals.normalize(term).trim())
                .filter(term -> !term.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    /** Same normalization, for multi-word openers matched against the whole message. */
    private static Set<String> normalizedPhrases(String... phrases) {
        return normalizedTokens(phrases);
    }
}
