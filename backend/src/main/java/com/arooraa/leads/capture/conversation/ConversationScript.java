package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.domain.LeadLanguage;

/**
 * Every sentence the assistant can ever send, in English and Tamil (frontend-v2/docs/lead-capture.md).
 * Nothing outbound is generated: a model may help <em>understand</em> a reply, but it never writes
 * one, so no price, promise or invented fact can reach a customer through it.
 *
 * Rules the copy keeps: one question per message, no price, no claim that a person is replying
 * live right now.
 */
public final class ConversationScript {

    private ConversationScript() {
    }

    private static final String WELCOME_EN =
            "Welcome to AROORAA! Which language do you prefer? Reply 1 for English, 2 for தமிழ்.";
    private static final String WELCOME_TA =
            "AROORAA-க்கு வரவேற்கிறோம்! எந்த மொழியில் பேசலாம்? English-க்கு 1, தமிழுக்கு 2 அனுப்புங்கள்.";

    private static final String LANGUAGE_RETRY_EN = "Sorry, I didn't catch that. Reply 1 for English, 2 for தமிழ்.";
    private static final String LANGUAGE_RETRY_TA = "மன்னிக்கவும், புரியவில்லை. English-க்கு 1, தமிழுக்கு 2 அனுப்புங்கள்.";

    private static final String REQUIREMENT_EN = "What would you like help with? 1 Website · 2 Customer enquiries & WhatsApp"
            + " · 3 AI & automation · 4 Marketing & leads · 5 Business application · 6 Not sure yet";
    private static final String REQUIREMENT_TA = "உங்களுக்கு என்ன தேவை? 1 Website · 2 Customer enquiries & WhatsApp"
            + " · 3 AI & Automation · 4 Marketing & Leads · 5 Business Application · 6 இன்னும் தெரியவில்லை";

    private static final String BUSINESS_TYPE_EN = "What kind of business do you run?";
    private static final String BUSINESS_TYPE_TA = "உங்கள் business என்ன வகை?";
    private static final String BUSINESS_TYPE_HINT_EN = " For example: shop, clinic, restaurant, school.";
    private static final String BUSINESS_TYPE_HINT_TA = " உதாரணமாக: கடை, clinic, restaurant, school.";

    private static final String CALL_TIME_EN = "When is a good time for our team to call you? Morning, afternoon or evening?";
    private static final String CALL_TIME_TA = "எங்கள் team உங்களை எப்போது அழைக்கலாம்? காலை, மதியம் அல்லது மாலை?";

    private static final String CLOSE_EN = "Thank you! Our team will call you at that time to understand your needs.";
    private static final String CLOSE_TA = "நன்றி! அந்த நேரத்தில் எங்கள் team உங்களை அழைத்து உங்கள் தேவைகளை புரிந்துகொள்ளும்.";

    private static final String PRICE_EN = "Pricing depends on what you need, so our team will share it after understanding"
            + " your requirement.";
    private static final String PRICE_TA = "உங்கள் தேவையைப் பொறுத்து கட்டணம் மாறும் — உங்கள் requirement-ஐ புரிந்துகொண்ட"
            + " பிறகு எங்கள் team விவரங்களை பகிரும்.";

    private static final String RETRY_PREFIX_EN = "Sorry, I didn't catch that. ";
    private static final String RETRY_PREFIX_TA = "மன்னிக்கவும், புரியவில்லை. ";

    private static final String HANDOFF_EN = "Thank you. A member of the AROORAA team will continue this conversation"
            + " with you here.";
    private static final String HANDOFF_TA = "நன்றி. AROORAA team-இல் ஒருவர் இங்கேயே உங்களுடன் உரையாடலைத் தொடர்வார்.";

    /** Language is always asked first; {@code sourceLocale} only decides which line comes first. */
    public static String welcome(LeadLanguage sourceLocale) {
        return bilingual(WELCOME_EN, WELCOME_TA, sourceLocale);
    }

    public static String languageRetry(LeadLanguage sourceLocale) {
        return bilingual(LANGUAGE_RETRY_EN, LANGUAGE_RETRY_TA, sourceLocale);
    }

    public static String question(QuestionStep step, LeadLanguage language) {
        boolean ta = language == LeadLanguage.TA;
        return switch (step) {
            case LANGUAGE -> welcome(language);
            case REQUIREMENT -> ta ? REQUIREMENT_TA : REQUIREMENT_EN;
            case BUSINESS_TYPE -> ta ? BUSINESS_TYPE_TA : BUSINESS_TYPE_EN;
            case CALL_TIME -> ta ? CALL_TIME_TA : CALL_TIME_EN;
        };
    }

    public static String retry(QuestionStep step, LeadLanguage language) {
        if (step == QuestionStep.LANGUAGE) {
            return languageRetry(language);
        }
        boolean ta = language == LeadLanguage.TA;
        String hint = step == QuestionStep.BUSINESS_TYPE ? (ta ? BUSINESS_TYPE_HINT_TA : BUSINESS_TYPE_HINT_EN) : "";
        return (ta ? RETRY_PREFIX_TA : RETRY_PREFIX_EN) + question(step, language) + hint;
    }

    /** The fixed pricing answer, followed by the still-open question (if any) so the chat keeps moving. */
    public static String priceAnswer(QuestionStep pendingStep, LeadLanguage language, LeadLanguage sourceLocale) {
        if (language == null) {
            String body = bilingual(PRICE_EN, PRICE_TA, sourceLocale);
            return pendingStep == null ? body : body + "\n\n" + welcome(sourceLocale);
        }
        String price = language == LeadLanguage.TA ? PRICE_TA : PRICE_EN;
        return pendingStep == null ? price : price + " " + question(pendingStep, language);
    }

    public static String close(LeadLanguage language) {
        return language == LeadLanguage.TA ? CLOSE_TA : CLOSE_EN;
    }

    public static String handoff(LeadLanguage language, LeadLanguage sourceLocale) {
        if (language == null) {
            return bilingual(HANDOFF_EN, HANDOFF_TA, sourceLocale);
        }
        return language == LeadLanguage.TA ? HANDOFF_TA : HANDOFF_EN;
    }

    private static String bilingual(String en, String ta, LeadLanguage first) {
        return first == LeadLanguage.TA ? ta + "\n" + en : en + "\n" + ta;
    }
}
