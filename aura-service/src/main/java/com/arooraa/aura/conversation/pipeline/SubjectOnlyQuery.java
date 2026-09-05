package com.arooraa.aura.conversation.pipeline;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Pipeline stage 7.5 (A5.2.4). Rewrites the retrieval query when the visitor's message is nothing
 * but a subject and a way of asking what it is for.
 *
 * <p>The owner asked "mesa uses?" and was answered about the open-source graphics library. The
 * resolver's blindness to "what is it <em>for</em>" was half of that; the other half is that a
 * two-word fragment is a terrible query. Its embedding is dominated by filler, and against a real
 * provider these fragments sit right on the evidence gate's similarity floor and fall either side
 * of it on one character: "mesa uses?" scored 0.332 and passed, "mesa use?" scored 0.294 and did
 * not. No amount of threshold tuning makes that reliable, and lowering the floor to catch them
 * would be exactly the wrong repair.
 *
 * <p>{@link PageAwareScopeResolver} already solved this shape once, for "Tell me more about this."
 * — a message whose subject lives outside its own words. The reasoning there applies unchanged
 * here, so the mechanism does too: when the subject is known and the message says nothing else,
 * search for the subject. The only difference is where the subject came from — page context there,
 * the entity resolver here.
 *
 * <p>The whole safety of this rests on "says nothing else", so that test is conservative. A single
 * word carrying content of its own — "pricing", "customers", "restaurants" — and the visitor's
 * question stands exactly as written, to succeed or to come back empty on its own merits. This is
 * what keeps "How many paying MESA customers do you have?" unanswerable: the corpus holds no
 * customer count, and rewriting that to "Tell me about MESA" would have dressed a general product
 * description up as an answer to a question nobody could answer. Retrieval still runs once, still
 * against the same thresholds, and can still come back with nothing.
 */
public final class SubjectOnlyQuery {

    private SubjectOnlyQuery() {
    }

    /**
     * Words that carry nothing for retrieval to search on: question frames, auxiliaries, articles,
     * pronouns, and the "what is this for" vocabulary that prompted this milestone. A term missing
     * from this list is treated as content, which is the safe direction to be wrong in — it leaves
     * the visitor's own query alone.
     */
    private static final Set<String> NO_CONTENT_OF_ITS_OWN = Set.of(
            "what", "whats", "which", "who", "how", "why", "when", "where", "much", "many",
            "is", "are", "was", "were", "be", "do", "does", "did", "done",
            "can", "could", "will", "would", "should",
            "the", "a", "an", "of", "for", "to", "in", "on", "at", "by", "with", "and", "or",
            "it", "its", "this", "that", "these", "those", "there",
            "i", "me", "my", "we", "us", "our", "you", "your", "yours",
            "tell", "about", "more", "please", "some", "any", "s",
            // The A5.2.4 vocabulary itself: asking what a thing is for says nothing about which
            // part of the corpus answers it.
            "use", "uses", "used", "using", "useful", "usage", "purpose", "purposes",
            "benefit", "benefits", "good", "work", "works",
            // Tanglish askers, matching the resolver's own small set. "enna use" and "ethuku use"
            // are the same question in the same shape.
            "enna", "ethuku", "edhuku", "epdi", "eppadi", "pannum", "pannuthu", "ku", "kku", "na");

    /**
     * @param query    the retrieval query as it stands — already canonicalised, and already
     *                 contextualised by {@link PageAwareScopeResolver} if that stage fired
     * @param subjects the entities the resolver confidently recognised, canonical names
     * @return {@code "Tell me about <subject>"} when the query says nothing beyond its subject,
     *         and the query untouched in every other case
     */
    public static String contextualize(String query, List<String> subjects) {
        if (subjects == null || subjects.isEmpty() || query == null || query.isBlank()) {
            return query;
        }
        Set<String> subjectWords = new LinkedHashSet<>();
        for (String subject : subjects) {
            subjectWords.addAll(words(subject));
        }
        for (String word : words(query)) {
            if (!subjectWords.contains(word) && !NO_CONTENT_OF_ITS_OWN.contains(word)) {
                return query;
            }
        }
        return "Tell me about " + String.join(" and ", subjects);
    }

    private static List<String> words(String text) {
        return Arrays.stream(TextSignals.normalize(text).trim().split(" "))
                .filter(word -> !word.isBlank())
                .toList();
    }
}
