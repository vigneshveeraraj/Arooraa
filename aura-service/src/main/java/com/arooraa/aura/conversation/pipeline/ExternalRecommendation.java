package com.arooraa.aura.conversation.pipeline;

import java.util.List;
import java.util.Locale;

/**
 * Who Aura is allowed to send a visitor to, and when (A1.5).
 *
 * <h2>Why this is code and not a line in the prompt</h2>
 * Asked for help learning to code, Aura recommended Codecademy, freeCodeCamp and Coursera. It was
 * being helpful, and nothing anywhere told it not to — the instruction it had said "this is
 * consulting, not a referral back to us", which is good advice against being a walking
 * advertisement and terrible advice about handing a possible customer to somebody else.
 *
 * <p>A prompt line would have fixed that particular answer. It would not have made the rule
 * reliable, because the model decides afresh every turn whether a referral is warranted, and the
 * cost of it deciding wrong is a visitor sent to a competitor. So the permission is decided
 * upstream and checked again on the way out: the same decision instructs generation and validates
 * it, and the two cannot drift apart.
 *
 * <h2>What is not forbidden</h2>
 * This is not a gag on the outside world. Naming a technology, a standard, a language or a public
 * body of knowledge is ordinary technical conversation and none of it is listed here. What is
 * listed is the narrow set of places that would take the visitor's work away — teaching platforms,
 * freelancer marketplaces, agencies and directly competing build-it-yourself products — and even
 * those are allowed the moment the visitor asks for them.
 */
public final class ExternalRecommendation {

    private ExternalRecommendation() {
    }

    /**
     * Commercial destinations that would take the work elsewhere. Named companies only: no generic
     * word like "course" or "tutorial" belongs here, because Aura should be free to say that
     * courses exist without naming a vendor.
     */
    private static final List<String> COMPETING_DESTINATIONS = List.of(
            // Teaching platforms — the ones from the reported defect and their obvious neighbours.
            "codecademy", "freecodecamp", "free code camp", "w3schools", "w3 schools", "udemy",
            "coursera", "khan academy", "pluralsight", "edx", "udacity", "skillshare",
            "datacamp", "leetcode", "hackerrank", "geeksforgeeks", "tutorialspoint",
            // Freelancer marketplaces and agencies.
            "upwork", "fiverr", "toptal", "freelancer com", "guru com", "peopleperhour",
            "accenture", "infosys", "cognizant", "capgemini", "deloitte digital",
            // Build-it-yourself products that compete directly with a project engagement.
            "shopify", "wix", "squarespace", "webflow", "bigcommerce", "woocommerce",
            "godaddy website", "hostinger website builder");

    /**
     * The visitor asking, in so many words, to be pointed somewhere. Only an explicit ask counts:
     * describing a problem is not a request for a reading list.
     */
    private static final List<String> ASKED_FOR_RESOURCES = List.of(
            "resource", "resources", "recommend a course", "recommend a book", "recommend some",
            "any courses", "any course", "any books", "any tutorials", "any resources",
            "which course", "which book", "which website", "which platform", "where can i learn",
            "where should i learn", "where do i learn", "suggest a course", "suggest some",
            "suggest a book", "best course", "best book", "best website to learn",
            "free course", "free courses", "online course", "online courses",
            "book recommendation", "reading list", "learning resources",
            // Natural phrasings the exact-phrase list kept missing: "any good books on X" contains
            // neither "any books" nor "book recommendation".
            "good book", "good books", "book on", "books on", "book about", "books about",
            "books for", "any book", "some books", "good course", "good courses",
            "good resources", "good tutorial", "good tutorials",
            // A1.5 follow-up: "give me good websites to learn Java" is an explicit ask, same shape
            // as "good books"/"good courses" above, just for a website rather than a book.
            "good website", "good websites", "any website", "any websites", "which websites",
            "best website", "best websites", "websites to learn", "websites for learning");

    /** Whether the visitor explicitly asked to be pointed at outside material. */
    public static boolean requestedBy(String message) {
        return TextSignals.containsAny(TextSignals.normalize(message), ASKED_FOR_RESOURCES);
    }

    /** Whether this text names one of the destinations above. */
    public static boolean namesACompetingDestination(String text) {
        return TextSignals.containsAny(TextSignals.normalize(text), COMPETING_DESTINATIONS);
    }

    /**
     * The answer with every sentence naming a competing destination removed.
     *
     * <p>Sentence-level rather than word-level on purpose. Deleting just the company name leaves
     * "there are plenty of structured courses on , or " — mangled text that reads like a bug and
     * tells the visitor nothing. The sentence carrying the referral is the unit of meaning, so the
     * sentence is what goes, and what remains is still a coherent answer in Aura's own voice.
     */
    public static String strip(String answer) {
        StringBuilder kept = new StringBuilder();
        for (String sentence : splitKeepingDelimiters(answer)) {
            if (!namesACompetingDestination(sentence)) {
                kept.append(sentence);
            }
        }
        return kept.toString().replaceAll("\\s{2,}", " ").trim();
    }

    /** Splits into sentences, keeping the terminator attached so reassembly reads normally. */
    private static List<String> splitKeepingDelimiters(String text) {
        List<String> sentences = new java.util.ArrayList<>();
        int start = 0;
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '.' || c == '!' || c == '?' || c == '\n') {
                // Consume any run of terminators and the whitespace after them, so "Yes!! Next"
                // splits once rather than leaving empty fragments behind.
                int end = i + 1;
                while (end < text.length() && (text.charAt(end) == '.' || text.charAt(end) == '!'
                        || text.charAt(end) == '?' || Character.isWhitespace(text.charAt(end)))) {
                    end++;
                }
                sentences.add(text.substring(start, end));
                start = end;
                i = end - 1;
            }
        }
        if (start < text.length()) {
            sentences.add(text.substring(start));
        }
        return sentences;
    }

    /** Lower-cased containment used by the tests to describe intent readably. */
    static boolean mentions(String text, String term) {
        return text != null && text.toLowerCase(Locale.ROOT).contains(term.toLowerCase(Locale.ROOT));
    }
}
