package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.domain.LeadLanguage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Last check on every outbound message, after the script. Today every reply is a fixed
 * {@link ConversationScript} sentence, so this should never fire; it exists so that a future
 * change — a new template, or someone wiring model output to the customer — can't send an amount
 * of money or a phone number without a test failing and the message being replaced.
 */
@Component
public class OutboundMessageGuard {

    private static final Logger log = LoggerFactory.getLogger(OutboundMessageGuard.class);

    private static final Pattern AMOUNT = Pattern.compile(
            "(?i)(₹|rs\\.?\\s*\\d|\\binr\\b|\\brupees?\\b|ரூ|ரூபாய்|\\d\\s*/-|\\d[\\d,]*\\s*(k|lakh|lakhs|lac|crore|thousand)\\b"
                    + "|\\b\\d{1,3}(,\\d{2,3})+\\b|\\$\\s*\\d|\\b\\d{4,}\\b)");
    /** Ten or more digits, allowing the separators people type in phone numbers. */
    private static final Pattern PHONE = Pattern.compile("\\+?\\d[\\d\\s-]{8,}\\d");

    public boolean isSafe(String message) {
        return !AMOUNT.matcher(message).find() && !PHONE.matcher(message).find();
    }

    /** The message itself if safe; otherwise the handoff sentence, and an error in the log. */
    public String sanitize(String message, LeadLanguage language, LeadLanguage sourceLocale) {
        if (isSafe(message)) {
            return message;
        }
        log.error("lead-conversation outbound message blocked by guard; replaced with handoff");
        return ConversationScript.handoff(language, sourceLocale);
    }
}
