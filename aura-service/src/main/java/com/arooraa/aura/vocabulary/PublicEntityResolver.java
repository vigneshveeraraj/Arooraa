package com.arooraa.aura.vocabulary;

import com.arooraa.aura.conversation.pipeline.PageContextRegistry;
import com.arooraa.aura.conversation.pipeline.TextSignals;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Recognises approved AROORAA public entities in a visitor's words, however speech-to-text spelled
 * them, and writes them the way AROORAA writes them.
 *
 * <p>The problem this exists for is small and specific. A visitor says "MESA" clearly and the
 * provider returns Meesa, Meso, Messa or Meeza; the question then names no organisation subject, so
 * {@code ScopeClassifier} routes it to the general fallback, retrieval never runs, and Aura answers
 * a question about its own product as though it had never heard of it. One word being misheard
 * costs the visitor the entire answer.
 *
 * <p><b>What this is not.</b> It is not autocorrect, and the difference matters more than the
 * feature does. It never touches a word that is not a registered form of a public entity, so no
 * amount of unusual language, Tamil, Tanglish or ordinary misspelling is rewritten by it. And it
 * decides nothing about what Aura may then say: resolving "meesa" to MESA produces a better
 * retrieval query, and the answer still has to come through classification, the confidentiality
 * boundary, the evidence gate and the output guardrail exactly as before. There is no path from
 * here to an answer.
 *
 * <p><b>The false-positive rule.</b> The owner's own counterexample is the specification: "I want a
 * mesa in my dining room" must not become a product question merely because the letters m-e-s-a
 * appear. So recognition is graded rather than absolute. A spelling registered as
 * {@link PublicEntity.Certainty#DISTINCTIVE} — one nobody types by accident — resolves on its own.
 * A spelling registered as {@link PublicEntity.Certainty#EVERYDAY}, and every near miss inside
 * {@link SpeechShape}'s envelope, resolves only when the sentence around it supports it. The four
 * cases are one small table (see the constants below), and the threshold is one number.
 *
 * <p><b>Channel-neutral.</b> Nothing here knows whether the words were spoken or typed. Voice
 * canonicalises a transcript before showing it to the visitor, so they confirm what Aura understood;
 * the conversation pipeline canonicalises what its deterministic stages read while leaving the
 * stored message, and the turn the model is shown, exactly as the visitor wrote it.
 */
@Component
public class PublicEntityResolver {

    /**
     * The scoring table, in full. Four cases, one threshold, no other conditions anywhere.
     *
     * <pre>
     *                   written exactly   near miss
     *   DISTINCTIVE          1.00           0.55
     *   EVERYDAY             0.55           0.35
     *   contextual support  +0.35
     *   resolves at         ≥0.75
     * </pre>
     *
     * <p>Read across: a distinctive spelling resolves alone; a distinctive near miss and an
     * everyday spelling each resolve with support; an everyday near miss never resolves at all,
     * which is deliberate — a fuzzy match to a word that is already an ordinary word is exactly the
     * shape of the mistake this milestone must not make.
     */
    private static final double DISTINCTIVE_EXACT = 1.00;
    private static final double DISTINCTIVE_NEAR = 0.55;
    private static final double EVERYDAY_EXACT = 0.55;
    private static final double EVERYDAY_NEAR = 0.35;
    private static final double CONTEXTUAL_SUPPORT = 0.35;
    private static final double RESOLVES_AT = 0.75;

    /** Letters and digits; everything else is a boundary. Mirrors {@link TextSignals#normalize}. */
    private static final Pattern WORD = Pattern.compile("[\\p{L}\\p{Nd}]+");

    /**
     * Where one thought ends and the next begins. Support has to be nearby to mean anything: in
     * "I want a mesa in my dining room, but tell me about your products too" the second half is
     * plainly about AROORAA and the first half plainly is not, and a whole-message scan would let
     * the second half vouch for the first.
     */
    private static final Pattern CLAUSE_BOUNDARY = Pattern.compile("[.!?;,\\n]+|[–—]|--");

    /**
     * Words and phrases that say a sentence is asking about a product or a company. Kept to that:
     * nothing here names an industry, a room or a use case, because "restaurant" and "dining room"
     * are neighbours and the counterexample lives in the second one.
     *
     * <p>Matched at word boundaries against the clause with the candidate itself blanked out, so a
     * word can never vouch for itself.
     */
    private static final List<String> ENTITY_INTENT = List.of(
            "tell me about", "tell me more", "tell us about", "more about", "about",
            "what is", "what s", "whats", "what does", "what do", "what are", "what can",
            "how does", "how do", "how can", "how is", "how much",
            "can it", "does it", "is it", "do you", "can you", "your", "yours", "you offer",
            "explain", "difference between", "compare",
            "arooraa", "aura", "company",
            "product", "products", "platform", "app", "application", "software", "system",
            "solution", "solutions", "feature", "features", "pricing", "price", "cost", "demo",
            "integrate", "integration", "works", "work", "use case", "customers", "clients");

    /**
     * @param text the visitor's words, spoken or typed
     * @param currentPath the page they are on, or null. Context only, exactly as everywhere else in
     *        Aura: an unknown path resolves to no subject, so a client-supplied string can never
     *        conjure support that a real page would not have given
     */
    public EntityResolution resolve(String text, String currentPath) {
        if (text == null || text.isBlank()) {
            return EntityResolution.unchanged(text == null ? "" : text);
        }
        List<Word> words = words(text);
        if (words.isEmpty()) {
            return EntityResolution.unchanged(text);
        }

        String pageSubject = PageContextRegistry.resolve(currentPath)
                .map(PageContextRegistry.PageSubject::name)
                .orElse(null);
        // One cheap pre-scan rather than a second resolution pass: a message that already names an
        // entity unambiguously somewhere vouches for a borderline mention of *that same entity*
        // elsewhere in it — "Meesa … the mesa" is one product being talked about twice. Scoped per
        // entity rather than message-wide, so naming Mindra clearly says nothing about "mesa".
        Set<String> alreadyNamed = entitiesNamedUnambiguously(text);

        List<EntityResolution.Mention> mentions = new ArrayList<>();
        StringBuilder canonical = new StringBuilder();
        int copiedUpTo = 0;
        int index = 0;

        while (index < words.size()) {
            Resolved resolved = resolveAt(words, index, text, pageSubject, alreadyNamed);
            if (resolved == null) {
                index++;
                continue;
            }
            Word first = words.get(index);
            Word last = words.get(index + resolved.wordCount() - 1);
            String matched = text.substring(first.start(), last.end());
            mentions.add(new EntityResolution.Mention(resolved.canonicalName(), matched, resolved.confidence()));

            canonical.append(text, copiedUpTo, first.start()).append(resolved.canonicalName());
            copiedUpTo = last.end();
            index += resolved.wordCount();
        }

        if (mentions.isEmpty()) {
            return EntityResolution.unchanged(text);
        }
        canonical.append(text, copiedUpTo, text.length());
        return new EntityResolution(text, canonical.toString(), List.copyOf(mentions));
    }

    public EntityResolution resolve(String text) {
        return resolve(text, null);
    }

    /** @param wordCount how many words of the message this mention consumed */
    private record Resolved(String canonicalName, int wordCount, double confidence) {
    }

    /**
     * The longest run of words starting here that resolves to an entity.
     *
     * <p>Longest first, so "Arooraa Smart Home" is one product rather than the company followed by
     * something else. A run that matches a registered form but does not clear the threshold stops
     * the search rather than falling through to a shorter one: an ambiguous "mesa" that the
     * sentence does not support is a word we have decided not to act on, not an invitation to look
     * for something else it might have been.
     */
    private Resolved resolveAt(List<Word> words, int index, String text, String pageSubject,
                                Set<String> alreadyNamed) {
        int widest = Math.min(PublicEntityAliasRegistry.longestFormInWords(), words.size() - index);
        for (int length = widest; length >= 1; length--) {
            String[] run = new String[length];
            for (int offset = 0; offset < length; offset++) {
                run[offset] = words.get(index + offset).normalized();
            }
            Optional<PublicEntityAliasRegistry.Match> found = PublicEntityAliasRegistry.lookup(run);
            if (found.isEmpty()) {
                continue;
            }
            PublicEntityAliasRegistry.Match match = found.get();
            int from = words.get(index).start();
            int to = words.get(index + length - 1).end();
            boolean supported = alreadyNamed.contains(match.entity().canonicalName())
                    || namesThisPage(pageSubject, match.entity())
                    || clauseAsksAboutAnEntity(text, from, to);
            double confidence = score(match) + (supported ? CONTEXTUAL_SUPPORT : 0);
            if (confidence < RESOLVES_AT) {
                return null;
            }
            return new Resolved(match.entity().canonicalName(), length, confidence);
        }
        return null;
    }

    private static double score(PublicEntityAliasRegistry.Match match) {
        boolean distinctive = match.certainty() == PublicEntity.Certainty.DISTINCTIVE;
        if (match.exact()) {
            return distinctive ? DISTINCTIVE_EXACT : EVERYDAY_EXACT;
        }
        return distinctive ? DISTINCTIVE_NEAR : EVERYDAY_NEAR;
    }

    /** The visitor is standing on this entity's own page, which is about as supportive as context gets. */
    private static boolean namesThisPage(String pageSubject, PublicEntity entity) {
        return pageSubject != null && pageSubject.equalsIgnoreCase(entity.canonicalName());
    }

    /**
     * Whether the clause holding this candidate is asking about a product or a company — measured
     * with the candidate itself removed, so "arooraa" cannot vouch for "arooraa".
     */
    private static boolean clauseAsksAboutAnEntity(String text, int from, int to) {
        int start = clauseStart(text, from);
        int end = clauseEnd(text, to);
        String around = text.substring(start, from) + " " + text.substring(to, end);
        return TextSignals.containsAny(TextSignals.normalize(around), ENTITY_INTENT);
    }

    private static int clauseStart(String text, int from) {
        Matcher boundary = CLAUSE_BOUNDARY.matcher(text.substring(0, from));
        int start = 0;
        while (boundary.find()) {
            start = boundary.end();
        }
        return start;
    }

    private static int clauseEnd(String text, int to) {
        Matcher boundary = CLAUSE_BOUNDARY.matcher(text);
        return boundary.find(to) ? boundary.start() : text.length();
    }

    /**
     * Which entities the message spells out in a way that could only be one of ours. An exact scan
     * over the normalized message, so it costs one pass and none of the matching machinery.
     */
    private static Set<String> entitiesNamedUnambiguously(String text) {
        String normalized = TextSignals.normalize(text);
        Set<String> named = new HashSet<>();
        for (PublicEntity entity : PublicEntityAliasRegistry.entities()) {
            for (PublicEntity.Form form : entity.forms()) {
                if (form.certainty() != PublicEntity.Certainty.DISTINCTIVE) {
                    continue;
                }
                if (normalized.contains(" " + TextSignals.normalize(form.words()).trim() + " ")) {
                    named.add(entity.canonicalName());
                    break;
                }
            }
        }
        return named;
    }

    /** @param normalized the word as the classifiers see it; empty words are dropped */
    private record Word(int start, int end, String normalized) {
    }

    private static List<Word> words(String text) {
        List<Word> words = new ArrayList<>();
        Matcher matcher = WORD.matcher(text);
        while (matcher.find()) {
            String normalized = TextSignals.normalize(matcher.group()).trim();
            if (!normalized.isEmpty()) {
                words.add(new Word(matcher.start(), matcher.end(), normalized));
            }
        }
        return words;
    }
}
