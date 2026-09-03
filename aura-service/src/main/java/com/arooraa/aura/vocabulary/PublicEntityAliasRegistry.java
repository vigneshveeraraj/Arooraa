package com.arooraa.aura.vocabulary;

import com.arooraa.aura.conversation.pipeline.TextSignals;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * The one canonical list of approved AROORAA public entities and the spellings each may be
 * recognised from. Nothing else in the service is allowed a second opinion about what "Meesa" means.
 *
 * <p>Held in code rather than in configuration on purpose. An alias list is a way to make Aura
 * treat one word as another, so a deployment that could add entries could quietly point an
 * ordinary English word at a product; there is no operational reason to want that, and the cost of
 * the restriction is a rebuild when a genuinely new product ships.
 *
 * <p>The lists are short, and that is a decision rather than an omission. The brief asked
 * explicitly not to invent a large guessed vocabulary: each entry below is either the canonical
 * spelling, one the owner reported from real testing, or an obvious near-neighbour of one of those.
 * Everything else is left to the bounded envelope in {@link SpeechShape}, which is measured against
 * these same entries — so widening recognition means adding a form somebody actually saw, not
 * loosening a threshold.
 */
public final class PublicEntityAliasRegistry {

    /**
     * The four public products and the company. Deliberately no entry for Aura itself: an assistant
     * that corrected people's spelling of its own name would be recognising the one word it is
     * least likely to be asked a grounded question about, and "aura" already carries weight as one
     * of the intent words in {@link PublicEntityResolver}.
     *
     * <p>Two absences were considered and rejected rather than overlooked. There is no bare "smart
     * home" form: it is a whole industry's word for itself, and it also collides with the
     * three-word product name, which would have put "AROORAA's Arooraa Smart Home" in a visitor's
     * own composer. And there is no bare "mirror", for the same reason in a smaller way.
     */
    private static final List<PublicEntity> ENTITIES = List.of(
            PublicEntity.of("MESA",
                    // "mesa" is a table in Spanish and Portuguese and a landform in English; "misa"
                    // is a Spanish noun and a given name. Both are recognised, neither on its own.
                    PublicEntity.everyday("mesa"),
                    PublicEntity.everyday("misa"),
                    PublicEntity.distinctive("meesa"),
                    PublicEntity.distinctive("meeza"),
                    PublicEntity.distinctive("messa"),
                    PublicEntity.distinctive("meso")),
            PublicEntity.of("Mindra",
                    PublicEntity.distinctive("mindra"),
                    PublicEntity.distinctive("mindhra"),
                    PublicEntity.distinctive("mindraa"),
                    PublicEntity.distinctive("meendra")),
            PublicEntity.of("Smart Mirror",
                    PublicEntity.distinctive("smart mirror"),
                    PublicEntity.distinctive("smartmirror"),
                    // The one shape SpeechShape will not reach on its own: "mirrow" loses the
                    // trailing r, which is a consonant change rather than a vowel one.
                    PublicEntity.distinctive("smart mirrow")),
            PublicEntity.of("Arooraa Smart Home",
                    PublicEntity.distinctive("arooraa smart home"),
                    PublicEntity.distinctive("aroora smart home"),
                    PublicEntity.distinctive("arora smart home"),
                    PublicEntity.distinctive("aurora smart home")),
            PublicEntity.of("AROORAA",
                    PublicEntity.distinctive("arooraa"),
                    PublicEntity.distinctive("aroora"),
                    PublicEntity.distinctive("aroraa"),
                    // A common Indian surname, and one of the most frequent English nouns a
                    // microphone reaches for. Recognised, but never on their own.
                    PublicEntity.everyday("arora"),
                    PublicEntity.everyday("aurora")));

    /** Every form, split into normalized words once at class load. */
    private static final List<Candidate> CANDIDATES = buildCandidates();

    private static final int MAX_FORM_WORDS = CANDIDATES.stream()
            .mapToInt(candidate -> candidate.words().length)
            .max()
            .orElse(1);

    private PublicEntityAliasRegistry() {
    }

    /** @param exact true when every word matched letter for letter, false for a near match */
    public record Match(PublicEntity entity, PublicEntity.Certainty certainty, boolean exact) {
    }

    private record Candidate(PublicEntity entity, PublicEntity.Certainty certainty, String[] words) {
    }

    public static List<PublicEntity> entities() {
        return ENTITIES;
    }

    /** The longest phrase worth looking at, so the resolver knows how wide a window to open. */
    public static int longestFormInWords() {
        return MAX_FORM_WORDS;
    }

    /**
     * The best entity this exact run of normalized words could name, if any.
     *
     * <p>"Best" is exactness first, then certainty: a phrase written exactly as a registered form
     * beats one that is a near miss of anything, and an exact distinctive form beats an exact
     * everyday one where both somehow apply. The resolver, not this method, decides whether the
     * winner is strong enough to act on.
     */
    public static Optional<Match> lookup(String[] words) {
        Match best = null;
        for (Candidate candidate : CANDIDATES) {
            if (candidate.words().length != words.length) {
                continue;
            }
            Boolean exact = compare(words, candidate.words());
            if (exact == null) {
                continue;
            }
            Match match = new Match(candidate.entity(), candidate.certainty(), exact);
            if (best == null || better(match, best)) {
                best = match;
            }
        }
        return Optional.ofNullable(best);
    }

    /**
     * @return {@code TRUE} when every word is identical, {@code FALSE} when exactly one word is a
     *         plausible mishearing and the rest are identical, {@code null} when this form does not
     *         apply at all
     */
    private static Boolean compare(String[] words, String[] form) {
        int misheard = 0;
        for (int index = 0; index < words.length; index++) {
            if (words[index].equals(form[index])) {
                continue;
            }
            if (misheard > 0 || !SpeechShape.couldBeMisheard(words[index], form[index])) {
                return null;
            }
            misheard++;
        }
        return misheard == 0;
    }

    private static boolean better(Match candidate, Match incumbent) {
        if (candidate.exact() != incumbent.exact()) {
            return candidate.exact();
        }
        return candidate.certainty() == PublicEntity.Certainty.DISTINCTIVE
                && incumbent.certainty() == PublicEntity.Certainty.EVERYDAY;
    }

    /**
     * Forms are written above the way a person writes them and normalized here, through the same
     * {@link TextSignals#normalize} a visitor's message goes through — so the two agree by
     * construction rather than because somebody typed the stripped spelling correctly.
     */
    private static List<Candidate> buildCandidates() {
        List<Candidate> candidates = new ArrayList<>();
        for (PublicEntity entity : ENTITIES) {
            for (PublicEntity.Form form : entity.forms()) {
                String normalized = TextSignals.normalize(form.words()).trim();
                if (normalized.isEmpty()) {
                    continue;
                }
                candidates.add(new Candidate(entity, form.certainty(), normalized.split("\\s+")));
            }
        }
        return List.copyOf(candidates);
    }
}
