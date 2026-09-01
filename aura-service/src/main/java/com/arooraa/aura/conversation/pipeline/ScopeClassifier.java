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

    /** Longest a message can be and still plausibly be nothing but small talk. */
    private static final int MAX_SOCIAL_TOKENS = 6;

    /** Hello, in the registers visitors actually use. */
    private static final Set<String> GREETINGS = normalizedTokens(
            "hi", "hii", "hiii", "hey", "heyy", "heyyy", "hello", "helo", "hallo", "hai", "hiya",
            "yo", "howdy", "hola", "greetings", "welcome", "sup",
            "morning", "afternoon", "evening", "night",
            "vanakkam", "vanakam", "வணக்கம்", "namaste", "namaskaram");

    /**
     * A small ask for, or reaction to, light humour. Aura is allowed a short harmless joke — that
     * is part of its personality — and asking for one is small talk, not a research question.
     */
    private static final Set<String> LIGHT_HUMOUR = normalizedTokens(
            "joke", "jokes", "laugh", "laughing", "funny", "hilarious",
            "haha", "hahaha", "hehe", "heh", "lol");

    /** Thanks and goodbyes. The end of a conversation is still part of one. */
    private static final Set<String> ACKNOWLEDGEMENTS = normalizedTokens(
            "thanks", "thank", "thankyou", "thx", "ty", "nandri", "cheers",
            "bye", "goodbye", "tata", "ciao");

    /** "nice", "cool" — a reaction to what Aura just said, with no question in it. */
    private static final Set<String> REACTIONS = normalizedTokens(
            "nice", "cool", "great", "awesome", "wow", "super", "lovely", "perfect",
            "excellent", "brilliant", "sweet");

    /**
     * At least one of these has to be present, or the message is not small talk at all. Keeping the
     * four families separate is not decoration: each is a deliberate, closed decision about what
     * Aura will handle without looking anything up, and the union is the whole of it.
     */
    private static final Set<String> SOCIAL_WORDS = union(GREETINGS, LIGHT_HUMOUR, ACKNOWLEDGEMENTS, REACTIONS);

    /**
     * Words that can surround a social word without turning the message into a question. Nothing
     * here carries any topic of its own — that is the whole point, and why the list stays short.
     */
    private static final Set<String> SOCIAL_PADDING = normalizedTokens(
            "good", "very", "there", "again", "aura", "arooraa", "team", "everyone", "all",
            "bro", "bruh", "buddy", "friend", "dude", "machan", "macha", "da", "boss",
            "sir", "madam", "mam", "maam", "anna", "akka",
            "how", "are", "you", "u", "r", "doing",
            // "tell me the joke", "one more please", "that's funny" — carriers, never subjects.
            "tell", "me", "a", "an", "the", "one", "more", "another", "make", "say", "something",
            "that", "thats", "please", "ok", "okay", "so", "much", "lot", "us",
            // Normalization drops the apostrophe, so "that's funny" arrives as "that s funny".
            "s",
            // "vanakkam epdi irukinga?" is one greeting, not a greeting plus a question.
            "epdi", "eppadi", "iruka", "irukinga", "irukkinga", "irukeenga", "nalla");

    /** Whole openers that carry no social word of their own but are still just small talk. */
    private static final Set<String> STANDALONE_SOCIAL = normalizedPhrases(
            "how are you", "how are you doing", "how r u", "how are u", "how's it going",
            "hows it going", "epdi irukinga", "eppadi irukkinga", "epdi iruka",
            "nalla irukingala", "sowkiyama");

    private static final List<String> CAREERS = List.of(
            "job", "jobs", "career", "careers", "hiring", "hire me", "vacancy", "vacancies",
            "internship", "intern", "apply", "application for", "resume", "cv", "recruitment",
            "work with you", "work at", "join your team", "opening", "openings");

    /**
     * A visitor stating something about a project of <em>their own</em>. Tanglish/Tamil included:
     * someone describing an idea rarely switches to English to do it.
     *
     * <p>These outrank the organisation-subject rule, which the softer markers below do not, and
     * the difference is whose system is being talked about. "I have a product idea — what services
     * can AROORAA provide?" is a person describing their project who also asked about us, and it
     * should be handled as discovery. "Can AROORAA modernize an existing application?" shares a
     * verb with it and is a plain question about our capability.
     */
    private static final List<String> OWN_PROJECT_STATEMENTS = List.of(
            "i have an idea", "app idea", "product idea", "software idea", "business idea",
            "crazy idea", "startup idea", "i want to build", "i want to develop", "i need an app",
            "i need a website", "we want to build", "we need an app", "want to create",
            "planning to build", "thinking of building", "idea iruku", "idea irukku",
            "build panna", "develop panna", "develop pannanum",
            "frustrated with my", "unhappy with my", "problems with my", "my current software");

    /**
     * Weaker discovery signals, which a question about AROORAA legitimately outranks — "modernize"
     * describes a service of ours as readily as a visitor's intention.
     */
    private static final List<String> PROJECT_DISCOVERY = List.of(
            "pannanum", "venum", "existing application", "existing software", "modernize", "modernise");

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
        boolean aboutArooraa = TextSignals.containsAny(text, ORGANISATION_SUBJECTS);

        ConfidentialityVerdict verdict = confidentialityClassifier.classify(message);
        if (verdict.internalBoundary()) {
            return decision(ConversationMode.INTERNAL_BOUNDARY, verdict, aboutArooraa);
        }
        // Before the organisation-subject rule below, which is what used to swallow "Hey Aura" —
        // and after confidentiality, which outranks everything including a friendly opening.
        if (isSmallTalk(text)) {
            return decision(ConversationMode.SOCIAL, verdict, aboutArooraa);
        }
        if (TextSignals.containsAny(text, CAREERS)) {
            return decision(ConversationMode.CAREERS, verdict, aboutArooraa);
        }
        if (aboutArooraa && TextSignals.containsAny(text, PRODUCT_SITUATION)) {
            return decision(ConversationMode.PRODUCT_DISCOVERY, verdict, aboutArooraa);
        }
        // Ahead of the organisation rule: somebody describing a project of their own is doing
        // discovery even when they name one of our products in the same breath. Whether that turn
        // then searches anything is the retrieval planner's call, not this one's.
        if (TextSignals.containsAny(text, OWN_PROJECT_STATEMENTS)) {
            return decision(ConversationMode.PROJECT_DISCOVERY, verdict, aboutArooraa);
        }
        // Checked before the weaker discovery markers so "can AROORAA modernize an existing
        // application?" stays a question about AROORAA's capability, while "I want to modernize my
        // existing application" — same verb, visitor's system — becomes discovery below.
        if (aboutArooraa) {
            return decision(ConversationMode.GROUNDED_QA, verdict, aboutArooraa);
        }
        if (TextSignals.containsAny(text, PROJECT_DISCOVERY)) {
            return decision(ConversationMode.PROJECT_DISCOVERY, verdict, aboutArooraa);
        }
        if (TextSignals.containsAny(text, NAVIGATION)) {
            return decision(ConversationMode.NAVIGATION, verdict, aboutArooraa);
        }
        if (TextSignals.containsAny(text, OUT_OF_SCOPE)) {
            return decision(ConversationMode.OUT_OF_SCOPE, verdict, aboutArooraa);
        }
        return decision(ConversationMode.GENERAL_CONSULTING, verdict, aboutArooraa);
    }

    private static ScopeDecision decision(ConversationMode mode, ConfidentialityVerdict verdict,
                                           boolean mentionsOrganisationSubject) {
        return new ScopeDecision(mode, verdict, mentionsOrganisationSubject);
    }

    /**
     * True when the <em>whole</em> message is small talk: a greeting, a thank-you, a reaction, or a
     * small ask for a joke.
     *
     * <p>Every token has to be a social word or social padding — one unrecognised word and this is
     * a message with a topic. That is what keeps "Hey Aura, what is MESA?" a question about MESA
     * while "Hey Aura" is just hello, and why this is a closed allow-list rather than a "starts
     * with hi" prefix check: the failure mode to avoid is a real question slipping into a mode that
     * answers without looking anything up.
     *
     * <p>Narrow by construction, and meant to stay that way. "Tell me a joke" is here because a
     * short harmless joke is part of Aura's personality; "tell me a joke about the election" is
     * not, because the moment a subject appears it is a request to write something, and Aura is
     * not an entertainment bot.
     */
    private boolean isSmallTalk(String normalized) {
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
        boolean socialWordPresent = false;
        for (String token : tokens) {
            boolean social = SOCIAL_WORDS.contains(token);
            if (!social && !SOCIAL_PADDING.contains(token)) {
                return false;
            }
            socialWordPresent |= social;
        }
        return socialWordPresent;
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

    @SafeVarargs
    private static Set<String> union(Set<String>... sets) {
        return Arrays.stream(sets).flatMap(Set::stream).collect(Collectors.toUnmodifiableSet());
    }
}
