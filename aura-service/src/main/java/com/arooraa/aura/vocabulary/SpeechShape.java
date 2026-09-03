package com.arooraa.aura.vocabulary;

/**
 * The bounded envelope inside which one spelling may be treated as a mishearing of another.
 *
 * <p>Deliberately narrow, because a wide one is worse than none. What speech-to-text actually does
 * to a short unfamiliar name is mangle its <em>vowels</em>: MESA comes back as Meesa, Mesa, Meso,
 * Messa, Misa. It very rarely invents or loses consonants, and when it does the result is usually a
 * different real word — which is precisely the case that must not be corrected.
 *
 * <p>So a near match requires two independent things to hold at once:
 *
 * <ol>
 *   <li>the same consonant skeleton, with runs of the same consonant collapsed, and</li>
 *   <li>an edit distance of at most one (two for longer words).</li>
 * </ol>
 *
 * <p>Either alone is too generous, and it is worth being concrete about why. "Messy" shares an edit
 * distance of one with "messa" and would be corrected to MESA on distance alone; its skeleton is
 * {@code M-S-Y} against {@code M-S}, so the first rule refuses it. "Mouse" shares the skeleton
 * {@code M-S} with "mesa" and would be corrected on shape alone; it is three edits away, so the
 * second rule refuses it. Requiring both leaves room for a vowel to be misheard and almost nothing
 * else.
 *
 * <p>Nothing here is a spell checker and nothing here runs over arbitrary language: it is only ever
 * asked whether one specific word could be one specific registered name.
 */
final class SpeechShape {

    /**
     * Below this a word is too short for any correction to be safe, on either side of the
     * comparison. Four-letter words are where this stopped being defensible: "miso" is one edit and
     * one skeleton away from "meso", and "mess" from "messa", so at four letters the envelope was
     * quietly offering to rewrite soup. Every registered form that genuinely needs near matching —
     * "mirror", "mindra", "meesa" — is five letters or more.
     */
    private static final int MIN_LENGTH = 5;

    /** Where the edit budget rises from one to two. */
    private static final int LONGER_WORD_LENGTH = 6;

    private SpeechShape() {
    }

    /**
     * @param candidate a normalized word from the visitor's message
     * @param registered a normalized word from the registry
     * @return true when {@code candidate} is close enough to be a plausible mishearing
     */
    static boolean couldBeMisheard(String candidate, String registered) {
        if (candidate.equals(registered)) {
            return false;
        }
        int shortest = Math.min(candidate.length(), registered.length());
        if (shortest < MIN_LENGTH || Math.abs(candidate.length() - registered.length()) > 2) {
            return false;
        }
        if (!consonantSkeleton(candidate).equals(consonantSkeleton(registered))) {
            return false;
        }
        int budget = shortest < LONGER_WORD_LENGTH ? 1 : 2;
        return editDistance(candidate, registered) <= budget;
    }

    /**
     * The word's consonants in order, with runs collapsed — "mirror" and "miror" both reduce to
     * {@code mror}, "meesa" and "mesa" both to {@code ms}.
     *
     * <p>'y' counts as a consonant rather than a vowel, and that is load-bearing rather than
     * pedantic: it is what separates "messy" from "messa".
     */
    private static String consonantSkeleton(String word) {
        StringBuilder skeleton = new StringBuilder(word.length());
        for (int index = 0; index < word.length(); index++) {
            char letter = word.charAt(index);
            if (isVowel(letter)) {
                continue;
            }
            if (skeleton.isEmpty() || skeleton.charAt(skeleton.length() - 1) != letter) {
                skeleton.append(letter);
            }
        }
        return skeleton.toString();
    }

    private static boolean isVowel(char letter) {
        return letter == 'a' || letter == 'e' || letter == 'i' || letter == 'o' || letter == 'u';
    }

    /**
     * Damerau-Levenshtein, counting a transposition as one edit — "mesa" and "msea" are one
     * mishearing apart, not two.
     */
    private static int editDistance(String left, String right) {
        int[][] distance = new int[left.length() + 1][right.length() + 1];
        for (int row = 0; row <= left.length(); row++) {
            distance[row][0] = row;
        }
        for (int column = 0; column <= right.length(); column++) {
            distance[0][column] = column;
        }
        for (int row = 1; row <= left.length(); row++) {
            for (int column = 1; column <= right.length(); column++) {
                int substitution = left.charAt(row - 1) == right.charAt(column - 1) ? 0 : 1;
                distance[row][column] = Math.min(
                        Math.min(distance[row - 1][column] + 1, distance[row][column - 1] + 1),
                        distance[row - 1][column - 1] + substitution);
                if (row > 1 && column > 1
                        && left.charAt(row - 1) == right.charAt(column - 2)
                        && left.charAt(row - 2) == right.charAt(column - 1)) {
                    distance[row][column] = Math.min(distance[row][column], distance[row - 2][column - 2] + 1);
                }
            }
        }
        return distance[left.length()][right.length()];
    }
}
