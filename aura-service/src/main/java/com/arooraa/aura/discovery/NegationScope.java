package com.arooraa.aura.discovery;

import com.arooraa.aura.retrieval.QueryTermCoverage;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Whether the only place a visitor mentioned something was to rule it out.
 *
 * <p>This exists because {@link BriefGrounding}'s coverage check cannot see it. Coverage asks
 * whether the words of an extracted value appear in what the visitor said, and in "we do not need
 * a mobile app" every word of "mobile app" appears — so a model that lists it under platforms
 * produces a value the grounding filter is happy with and a person at AROORAA would read as a
 * requirement. Negation is the one way a value can be perfectly grounded and still be the
 * opposite of true.
 *
 * <h2>How it decides</h2>
 * <ol>
 *   <li>The visitor's transcript is cut into clauses at sentence ends, dashes, commas and the
 *       coordinators that close a negation's scope — "we don't have a website, <b>so</b> we need a
 *       mobile app" is two clauses, and only the first is negated.</li>
 *   <li>A clause <em>supports</em> a value when most of the value's meaningful words are in it.</li>
 *   <li>A supporting clause is <em>negated</em> when the value is accounted for by the words
 *       <em>after</em> a negation cue in it and not by the words before. Which side of the cue it
 *       falls on is the whole question: "we want a web app rather than a mobile app" rules out the
 *       mobile app and asks for the web app, and both are in the same clause.</li>
 *   <li>The value is rejected only when it has supporting clauses and <b>every</b> one of them is
 *       negated. Mentioned once as a requirement anywhere, it stays.</li>
 * </ol>
 *
 * <p>A value whose words are scattered across clauses with no single clause supporting it is kept.
 * There is nothing to read a negation from, and this is a guard against a specific, checkable
 * mistake rather than a general attempt to understand English.
 *
 * <p><b>It is deliberately not applied to every field.</b> Only to the ones that assert the project
 * will contain something — capabilities, platforms, integrations, automation, existing systems.
 * A problem statement is very often a negative sentence ("parents are not told when a schedule
 * changes"), and so are constraints and unknowns; running this over them would delete the truest
 * things in the brief.
 */
final class NegationScope {

    /** How much of a value has to be inside one clause before that clause can speak for it. */
    private static final double SUPPORT = 0.6;

    /**
     * Where a negation stops reaching. Sentence ends, dashes, commas, and the small set of
     * coordinators that begin a new clause — without these, one negated word early in a long
     * sentence would rule out everything said after it.
     */
    private static final Pattern CLAUSE_BOUNDARY = Pattern.compile(
            "[.!?;,\\n]+|[–—]|--|"
                    + "\\b(?:and|but|so|however|although|though|whereas|because|otherwise)\\b");

    /**
     * Cues, in the forms people actually type. The contracted negatives are matched with an
     * optional apostrophe of either kind, because a browser will send "don't" and a phone keyboard
     * will send "don’t".
     */
    private static final Pattern NEGATION = Pattern.compile(
            "\\b(?:not|no|never|none|nothing|neither|nor|without|"
                    + "avoid\\w*|exclude\\w*|drop|skip|"
                    + "rather\\s+than|instead\\s+of|"
                    + "(?:do|does|did|is|are|was|were|will|would|ca|could|should|have|has|had|ai|wo)n['’]?t|"
                    + "cannot)\\b");

    private NegationScope() {
    }

    /**
     * @param value an extracted value that has already passed the coverage check
     * @param visitorTranscript everything the visitor said
     * @return true when every clause that could account for this value rules it out
     */
    static boolean rejects(String value, String visitorTranscript) {
        if (value == null || value.isBlank() || visitorTranscript == null) return false;
        if (QueryTermCoverage.meaningfulTerms(value).isEmpty()) return false;

        boolean supported = false;
        for (String clause : clauses(visitorTranscript)) {
            if (QueryTermCoverage.of(value, clause) < SUPPORT) continue;
            supported = true;
            if (!negated(clause, value)) {
                // Said plainly at least once. That is the visitor asking for it, whatever else
                // they said elsewhere, and it settles the matter.
                return false;
            }
        }
        return supported;
    }

    /** The transcript in pieces, each piece being as far as one negation can reach. */
    private static List<String> clauses(String transcript) {
        List<String> clauses = new ArrayList<>();
        for (String clause : CLAUSE_BOUNDARY.split(normalize(transcript))) {
            if (!clause.isBlank()) clauses.add(clause);
        }
        return clauses;
    }

    /**
     * Whether this clause rules the value out rather than asking for it.
     *
     * <p>The clause is split at its first negation cue and the value is measured against each
     * side. Accounted for after the cue and not before it, it was ruled out; accounted for before
     * it as well, the cue belongs to something else in the sentence and this is a requirement that
     * happens to sit next to one.
     *
     * <p>A cue that follows the value entirely — "a mobile app is not something we want" — reads
     * as un-negated here. That is a miss, and a deliberate one: this catches the way people
     * actually write an exclusion, and the visitor reviewing their own brief catches the rest.
     */
    private static boolean negated(String clause, String value) {
        Matcher cue = NEGATION.matcher(clause);
        if (!cue.find()) return false;

        boolean askedForBefore = QueryTermCoverage.of(value, clause.substring(0, cue.start())) >= SUPPORT;
        boolean ruledOutAfter = QueryTermCoverage.of(value, clause.substring(cue.end())) >= SUPPORT;
        return ruledOutAfter && !askedForBefore;
    }

    private static String normalize(String text) {
        String lowered = text.toLowerCase(Locale.ROOT);
        return Normalizer.normalize(lowered, Normalizer.Form.NFKD).replaceAll("\\p{M}+", "");
    }
}
