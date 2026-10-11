package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.domain.LeadLanguage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OutboundMessageGuardTest {

    private final OutboundMessageGuard guard = new OutboundMessageGuard();

    /** Every sentence the script can produce, for every language combination. */
    static List<String> everyScriptedMessage() {
        List<LeadLanguage> languages = new ArrayList<>(Arrays.asList(LeadLanguage.values()));
        languages.add(null);
        List<String> all = new ArrayList<>();
        for (LeadLanguage language : languages) {
            for (LeadLanguage sourceLocale : languages) {
                all.add(ConversationScript.welcome(sourceLocale));
                all.add(ConversationScript.close(language));
                all.add(ConversationScript.handoff(language, sourceLocale));
                all.add(ConversationScript.priceAnswer(null, language, sourceLocale));
                for (QuestionStep step : QuestionStep.values()) {
                    all.add(ConversationScript.question(step, language));
                    all.add(ConversationScript.retry(step, language));
                    all.add(ConversationScript.priceAnswer(step, language, sourceLocale));
                }
            }
        }
        return all;
    }

    @Test
    void noScriptedMessageIsEverBlocked() {
        for (String message : everyScriptedMessage()) {
            assertTrue(guard.isSafe(message), () -> "guard would block scripted message: " + message);
        }
    }

    @Test
    void noScriptedMessageContainsAPriceOrAPhoneNumber() {
        for (String message : everyScriptedMessage()) {
            assertFalse(message.matches("(?s).*\\d{3,}.*"), () -> "digits in: " + message);
            assertFalse(message.contains("₹"), () -> "currency in: " + message);
        }
    }

    @Test
    void noScriptedMessageClaimsAPersonIsReplyingLiveRightNow() {
        for (String message : everyScriptedMessage()) {
            String lower = message.toLowerCase();
            assertFalse(lower.contains("right now") || lower.contains("typing") || lower.contains("online now"),
                    () -> "live-agent claim in: " + message);
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"A website costs ₹15,000.", "Only Rs 4999!", "Starts at 15k", "Just 2 lakhs",
            "ரூ. 5000 மட்டும்", "Call us on +91 98765 43210", "Pay 1,50,000", "USD $300"})
    void blocksAmountsAndPhoneNumbersAndReplacesThemWithTheHandoff(String unsafe) {
        assertFalse(guard.isSafe(unsafe));
        assertEquals(ConversationScript.handoff(LeadLanguage.TA, LeadLanguage.EN),
                guard.sanitize(unsafe, LeadLanguage.TA, LeadLanguage.EN));
    }
}
