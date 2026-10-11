package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.conversation.Interpretation.Intent;
import com.arooraa.leads.capture.conversation.domain.InterpretationSource;
import com.arooraa.leads.capture.domain.LeadRequirement;
import com.arooraa.leads.capture.domain.PreferredCallTime;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The deterministic understanding of a reply, in English, Tamil script and Tanglish (Tamil typed
 * in English letters). It always runs first and is always available, so the conversation works
 * the same with the local model switched off, down or slow — the model only gets a say when
 * these rules come back {@link Intent#UNCLEAR}.
 *
 * Tamil-script keywords are matched with {@code contains}, not {@code \b}: Java's word
 * boundaries are ASCII-only and Tamil vowel signs would break them.
 */
@Component
public class RuleBasedReplyInterpreter {

    /** Whole-message opt-outs only, so "bus stop tea shop" is still a business type. */
    private static final Pattern STOP = Pattern.compile("^(stop|unsubscribe|cancel|நிறுத்து|niruthu|niruthunga)[.! ]*$");

    private static final Pattern HUMAN = Pattern.compile(
            "\\b(agent|human|representative|operator|executive|customer care|real person|talk to (a |some)?(person|someone|team)"
                    + "|speak to (a |some)?(person|someone|team)|aal kitta|yaaravadhu pesunga|aalu venum|aal venum)\\b");
    private static final List<String> HUMAN_TA = List.of("மனிதர்", "ஆள் வேண்டும்", "யாராவது பேசுங்க", "நபருடன்");

    /**
     * Asking about money in any form. "budget" and "package" are left out on purpose — they are
     * common in business descriptions ("budget hotel", "packaging unit").
     */
    private static final Pattern PRICE = Pattern.compile(
            "(₹|\\brs\\.?\\s*\\d|\\binr\\b|\\brupees?\\b|\\bprice|\\bpricing\\b|\\bcost(s|ing)?\\b|\\bcharges?\\b|\\bfees?\\b"
                    + "|\\brates?\\b|\\bquot(e|ation)\\b|how much|\\bevlo\\b|\\bevvalo\\b|\\bevvalavu\\b|\\byevlo\\b|\\bevalo\\b"
                    + "|\\bkaasu\\b|\\bpanam\\b|\\bselavu\\b|\\bvilai\\b|\\bkattanam\\b)");
    private static final List<String> PRICE_TA = List.of("விலை", "கட்டணம்", "எவ்வளவு", "செலவு", "காசு", "பணம்", "ரேட்", "ரூபாய்", "ரூ.");

    private static final Pattern ENGLISH = Pattern.compile("\\b(english|eng|inglish|ingilish|angilam)\\b");
    private static final Pattern TAMIL = Pattern.compile("\\b(tamil|thamizh|tamizh|thamil|tamizh)\\b");

    private static final Map<LeadRequirement, Pattern> REQUIREMENT_WORDS = Map.of(
            LeadRequirement.WEBSITE, Pattern.compile("\\b(website|web ?site|webpage|web page|site|landing page)\\b"),
            LeadRequirement.CUSTOMER_ENQUIRIES, Pattern.compile(
                    "\\b(enquir(y|ies)|inquir(y|ies)|whatsapp|customer (messages|enquiries|queries)|replies|reply to customers)\\b"),
            LeadRequirement.AI_AUTOMATION, Pattern.compile("\\b(ai|a\\.i\\.?|automation|automate|chatbot|bot)\\b"),
            LeadRequirement.MARKETING_LEADS, Pattern.compile(
                    "\\b(marketing|leads?|ads|advertis(ing|ement)|seo|social media|instagram|facebook|promotion|customers? (varanum|venum))\\b"),
            LeadRequirement.BUSINESS_APPLICATION, Pattern.compile(
                    "\\b(app|application|software|crm|erp|billing|inventory|dashboard|management system)\\b"),
            LeadRequirement.NOT_SURE, Pattern.compile(
                    "\\b(not sure|dont know|don't know|no idea|unsure|confused|theriyala|theriyadhu|theriyalai|therila)\\b"));
    private static final Map<LeadRequirement, List<String>> REQUIREMENT_TA = Map.of(
            LeadRequirement.WEBSITE, List.of("இணையதளம்", "வலைத்தளம்", "வெப்சைட்"),
            LeadRequirement.MARKETING_LEADS, List.of("விளம்பரம்", "மார்க்கெட்டிங்"),
            LeadRequirement.BUSINESS_APPLICATION, List.of("மென்பொருள்", "செயலி"),
            LeadRequirement.NOT_SURE, List.of("தெரியவில்லை", "தெரியல", "தெரியாது"));

    private static final Map<PreferredCallTime, Pattern> CALL_TIME_WORDS = Map.of(
            PreferredCallTime.MORNING, Pattern.compile("\\b(morning|mrng|morn|kaalai|kalai|kaalaila|kalaila|forenoon)\\b"),
            PreferredCallTime.AFTERNOON, Pattern.compile(
                    "\\b(afternoon|noon|lunch|madhiyam|mathiyam|mathiyanam|madhiyanam|after ?noon)\\b"),
            PreferredCallTime.EVENING, Pattern.compile("\\b(evening|eve|night|tonight|maalai|malai|saayangalam|sayangalam|iravu|after office)\\b"));
    private static final Map<PreferredCallTime, List<String>> CALL_TIME_TA = Map.of(
            PreferredCallTime.MORNING, List.of("காலை"),
            PreferredCallTime.AFTERNOON, List.of("மதியம்", "மத்தியானம்"),
            PreferredCallTime.EVENING, List.of("மாலை", "இரவு", "சாயங்காலம்"));
    private static final Pattern CLOCK_TIME = Pattern.compile("\\b(\\d{1,2})(?:[:.](\\d{2}))?\\s*(am|pm|a\\.m\\.|p\\.m\\.)");

    /** Replies that carry no business description at all. */
    private static final Set<String> NON_ANSWERS = Set.of(
            "hi", "hello", "hey", "ok", "okay", "k", "yes", "no", "yeah", "hmm", "thanks", "thank you", "vanakkam",
            "sari", "seri", "aama", "illa", "வணக்கம்", "சரி", "ஆமா", "இல்லை", "நன்றி");

    public Interpretation interpret(QuestionStep step, String rawText) {
        String text = normalize(rawText);
        if (text.isEmpty()) {
            return unclear();
        }
        if (STOP.matcher(text).matches() || HUMAN.matcher(text).find() || containsAny(text, HUMAN_TA)) {
            return Interpretation.of(Intent.HUMAN, InterpretationSource.RULES);
        }
        if (isPriceQuestion(text)) {
            return Interpretation.of(Intent.PRICE_QUESTION, InterpretationSource.RULES);
        }
        return switch (step) {
            case LANGUAGE -> language(text);
            case REQUIREMENT -> requirement(text);
            case BUSINESS_TYPE -> businessType(rawText.strip(), text);
            case CALL_TIME -> callTime(text);
        };
    }

    public boolean isPriceQuestion(String rawText) {
        String text = normalize(rawText);
        return PRICE.matcher(text).find() || containsAny(text, PRICE_TA);
    }

    private Interpretation language(String text) {
        if (text.equals("1") || text.equals("one")) {
            return Interpretation.answer("EN", InterpretationSource.RULES);
        }
        if (text.equals("2") || text.equals("two") || text.equals("௨")) {
            return Interpretation.answer("TA", InterpretationSource.RULES);
        }
        boolean english = ENGLISH.matcher(text).find() || text.contains("ஆங்கில");
        boolean tamil = TAMIL.matcher(text).find() || text.contains("தமிழ்");
        if (english ^ tamil) {
            return Interpretation.answer(english ? "EN" : "TA", InterpretationSource.RULES);
        }
        // Writing in Tamil script is itself an answer to "which language?".
        if (!english && mostlyTamilScript(text)) {
            return Interpretation.answer("TA", InterpretationSource.RULES);
        }
        return unclear();
    }

    private Interpretation requirement(String text) {
        Matcher digit = Pattern.compile("^([1-6])[.)]?$").matcher(text);
        if (digit.matches()) {
            int index = Integer.parseInt(digit.group(1)) - 1;
            return Interpretation.answer(LeadRequirement.values()[index].name(), InterpretationSource.RULES);
        }
        Set<LeadRequirement> matched = new LinkedHashSet<>();
        for (LeadRequirement requirement : LeadRequirement.values()) {
            Pattern words = REQUIREMENT_WORDS.get(requirement);
            if (words.matcher(text).find() || containsAny(text, REQUIREMENT_TA.getOrDefault(requirement, List.of()))) {
                matched.add(requirement);
            }
        }
        return matched.size() == 1
                ? Interpretation.answer(matched.iterator().next().name(), InterpretationSource.RULES)
                : unclear();
    }

    private Interpretation businessType(String original, String text) {
        String stripped = text.replaceAll("[\\p{Punct}\\s]", "");
        if (stripped.length() < 2 || stripped.chars().allMatch(Character::isDigit)
                || NON_ANSWERS.contains(text.replaceAll("[.!?]+$", ""))) {
            return unclear();
        }
        String cleaned = original.replaceAll("\\s+", " ");
        return Interpretation.answer(cleaned.length() > 150 ? cleaned.substring(0, 150) : cleaned,
                InterpretationSource.RULES);
    }

    private Interpretation callTime(String text) {
        Set<PreferredCallTime> matched = new LinkedHashSet<>();
        for (PreferredCallTime time : PreferredCallTime.values()) {
            if (CALL_TIME_WORDS.get(time).matcher(text).find() || containsAny(text, CALL_TIME_TA.get(time))) {
                matched.add(time);
            }
        }
        Matcher clock = CLOCK_TIME.matcher(text);
        while (clock.find()) {
            matched.add(fromClock(Integer.parseInt(clock.group(1)), clock.group(3).startsWith("p")));
        }
        return matched.size() == 1
                ? Interpretation.answer(matched.iterator().next().name(), InterpretationSource.RULES)
                : unclear();
    }

    private static PreferredCallTime fromClock(int hour, boolean pm) {
        int h24 = pm ? (hour % 12) + 12 : hour % 12;
        if (h24 < 12) {
            return PreferredCallTime.MORNING;
        }
        return h24 < 17 ? PreferredCallTime.AFTERNOON : PreferredCallTime.EVENING;
    }

    private static boolean mostlyTamilScript(String text) {
        long letters = text.codePoints().filter(Character::isLetter).count();
        long tamil = text.codePoints().filter(cp -> cp >= 0x0B80 && cp <= 0x0BFF && Character.isLetter(cp)).count();
        return letters > 0 && tamil * 2 > letters;
    }

    private static boolean containsAny(String text, List<String> needles) {
        for (String needle : needles) {
            if (text.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    static String normalize(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.toLowerCase(Locale.ROOT)
                .replace('’', '\'')
                .replaceAll("\\s+", " ")
                .strip();
    }

    private static Interpretation unclear() {
        return Interpretation.of(Intent.UNCLEAR, InterpretationSource.RULES);
    }
}
