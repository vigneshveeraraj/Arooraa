package com.arooraa.aura.retrieval;

import java.text.Normalizer;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * What fraction of a query's meaningful terms actually appear in a piece of evidence — the
 * absolute lexical signal the evidence gate uses, alongside vector similarity.
 *
 * <p>Computed in Java rather than from {@code ts_rank} because it needs to be <em>explainable</em>
 * and comparable across queries: {@code ts_rank} is a relative scoring function whose magnitude
 * depends on term frequency and document length, so a given value means nothing on its own.
 * "The passage contains 3 of the 4 meaningful words in the question" is directly interpretable and
 * directly calibratable.
 *
 * <p>Matching is prefix-based on normalized tokens, a deliberately crude stand-in for stemming:
 * it lets "modernize" match "modernization" and "restaurants" match "restaurant" without pulling
 * in a stemmer dependency or a database round-trip. Accents are stripped and case folded, so Tamil
 * script and Tanglish tokens are handled as ordinary Unicode letters rather than being dropped.
 */
public final class QueryTermCoverage {

    private static final Pattern TOKEN = Pattern.compile("[\\p{L}\\p{Nd}]+");
    private static final int MIN_PREFIX_MATCH = 4;

    /**
     * English function words carry no topical signal, so counting them would make every query look
     * partly covered by any passage. Kept short and query-side only — never applied to evidence.
     */
    private static final Set<String> STOPWORDS = Set.of(
            "a", "an", "the", "is", "are", "was", "were", "be", "been", "am", "do", "does", "did",
            "can", "could", "should", "would", "will", "shall", "may", "might", "must",
            "i", "you", "we", "they", "he", "she", "it", "my", "our", "your", "their",
            "of", "for", "to", "in", "on", "at", "by", "with", "from", "about", "into", "over",
            "and", "or", "but", "if", "then", "than", "that", "this", "these", "those",
            "what", "which", "who", "whom", "whose", "when", "where", "why", "how",
            "there", "here", "some", "any", "all", "no", "not", "have", "has", "had", "get", "got",
            "me", "us", "so", "as", "up", "out", "please", "tell", "show", "give");

    private QueryTermCoverage() {
    }

    /** 0.0 when the query has no meaningful terms or the evidence is empty; 1.0 when every meaningful query term is present. */
    public static double of(String query, String evidenceText) {
        Set<String> queryTerms = meaningfulTerms(query);
        if (queryTerms.isEmpty() || evidenceText == null || evidenceText.isBlank()) {
            return 0.0;
        }
        Set<String> evidenceTerms = tokens(evidenceText);

        int matched = 0;
        for (String term : queryTerms) {
            if (containsTerm(evidenceTerms, term)) {
                matched++;
            }
        }
        return (double) matched / queryTerms.size();
    }

    /** Query tokens with stopwords and single characters removed — exposed for test readability and diagnostics. */
    public static Set<String> meaningfulTerms(String query) {
        Set<String> meaningful = new LinkedHashSet<>();
        for (String token : tokens(query)) {
            if (token.length() > 1 && !STOPWORDS.contains(token)) {
                meaningful.add(token);
            }
        }
        return meaningful;
    }

    private static boolean containsTerm(Set<String> evidenceTerms, String term) {
        if (evidenceTerms.contains(term)) {
            return true;
        }
        if (term.length() < MIN_PREFIX_MATCH) {
            return false;
        }
        String prefix = term.substring(0, Math.max(MIN_PREFIX_MATCH, term.length() - 3));
        for (String candidate : evidenceTerms) {
            if (candidate.startsWith(prefix) || term.startsWith(candidate) && candidate.length() >= MIN_PREFIX_MATCH) {
                return true;
            }
        }
        return false;
    }

    private static Set<String> tokens(String text) {
        Set<String> tokens = new LinkedHashSet<>();
        Matcher matcher = TOKEN.matcher(normalize(text));
        while (matcher.find()) {
            tokens.add(matcher.group());
        }
        return tokens;
    }

    private static String normalize(String text) {
        String lowered = text.toLowerCase(Locale.ROOT);
        return Normalizer.normalize(lowered, Normalizer.Form.NFKD).replaceAll("\\p{M}+", "");
    }
}
