package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.conversation.ConversationEngine.Snapshot;
import com.arooraa.leads.capture.conversation.ConversationEngine.Turn;
import com.arooraa.leads.capture.conversation.domain.ConversationState;
import com.arooraa.leads.capture.conversation.model.DisabledModelReplyClassifier;
import com.arooraa.leads.capture.domain.LeadLanguage;
import com.arooraa.leads.capture.domain.LeadRequirement;
import com.arooraa.leads.capture.domain.PreferredCallTime;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ConversationEngineTest {

    private final RuleBasedReplyInterpreter rules = new RuleBasedReplyInterpreter();
    private final ConversationEngine engine =
            new ConversationEngine(new ReplyInterpreter(rules, new DisabledModelReplyClassifier()), rules);

    /** Drives the engine like LeadConversationService does, carrying state between turns. */
    private final class Chat {
        ConversationState state;
        LeadLanguage language;
        int unclear;
        final LeadLanguage sourceLocale;
        boolean hasRequirement;
        Turn last;

        Chat(LeadLanguage sourceLocale, boolean hasRequirement) {
            this.sourceLocale = sourceLocale;
            this.hasRequirement = hasRequirement;
            apply(engine.start(sourceLocale));
        }

        Turn say(String text) {
            apply(engine.handle(new Snapshot(state, language, sourceLocale, hasRequirement, unclear), text));
            if (last.updates().requirement() != null) {
                hasRequirement = true;
            }
            return last;
        }

        private void apply(Turn turn) {
            last = turn;
            state = turn.state();
            language = turn.language();
            unclear = turn.unclearCount();
        }

        String reply() {
            assertEquals(1, last.replies().size(), "exactly one message per turn");
            return last.replies().getFirst();
        }
    }

    @Test
    void alwaysAsksForTheLanguageFirstInBothLanguagesWithTheSourceLocaleFirst() {
        Chat ta = new Chat(LeadLanguage.TA, true);
        assertEquals(ConversationState.AWAITING_LANGUAGE, ta.state);
        assertTrue(ta.reply().startsWith("AROORAA-க்கு வரவேற்கிறோம்"));
        assertTrue(ta.reply().contains("Welcome to AROORAA!"));

        Chat en = new Chat(LeadLanguage.EN, true);
        assertTrue(en.reply().startsWith("Welcome to AROORAA!"));

        Chat whatsappFirst = new Chat(null, false);
        assertTrue(whatsappFirst.reply().startsWith("Welcome to AROORAA!"));
    }

    @Test
    void fullTamilConversationForAWebLeadSkipsTheRequirementQuestion() {
        // The page was English, but the customer chooses Tamil: the choice wins.
        Chat chat = new Chat(LeadLanguage.EN, true);

        chat.say("2");
        assertEquals(LeadLanguage.TA, chat.last.updates().language());
        assertEquals(ConversationState.AWAITING_BUSINESS_TYPE, chat.state);
        assertEquals("உங்கள் business என்ன வகை?", chat.reply());

        chat.say("துணிக்கடை, ஈரோடு");
        assertEquals("துணிக்கடை, ஈரோடு", chat.last.updates().businessType());
        assertEquals(ConversationState.AWAITING_CALL_TIME, chat.state);

        chat.say("மாலை");
        assertEquals(PreferredCallTime.EVENING, chat.last.updates().callTime());
        assertEquals(ConversationState.COMPLETED, chat.state);
        assertTrue(chat.reply().startsWith("நன்றி!"));
    }

    @Test
    void fullEnglishConversationAsksForTheRequirementWhenTheLeadHasNone() {
        Chat chat = new Chat(null, false);

        chat.say("English");
        assertEquals(ConversationState.AWAITING_REQUIREMENT, chat.state);
        assertTrue(chat.reply().startsWith("What would you like help with?"));

        chat.say("3");
        assertEquals(LeadRequirement.AI_AUTOMATION, chat.last.updates().requirement());
        assertEquals("What kind of business do you run?", chat.reply());

        chat.say("Dental clinic");
        chat.say("10 am");
        assertEquals(PreferredCallTime.MORNING, chat.last.updates().callTime());
        assertEquals(ConversationState.COMPLETED, chat.state);
        assertEquals(ConversationScript.close(LeadLanguage.EN), chat.reply());
    }

    @Test
    void aPriceQuestionGetsTheFixedAnswerAndTheSameQuestionAgain() {
        Chat chat = new Chat(LeadLanguage.TA, true);
        chat.say("2");

        chat.say("website evlo aagum?");
        assertEquals(ConversationState.AWAITING_BUSINESS_TYPE, chat.state, "a price question is not an answer");
        assertTrue(chat.reply().contains("கட்டணம் மாறும்"));
        assertTrue(chat.reply().endsWith("உங்கள் business என்ன வகை?"));
        assertEquals(null, chat.last.updates().businessType());
    }

    @Test
    void aPriceQuestionBeforeTheLanguageIsChosenIsAnsweredInBothLanguages() {
        Chat chat = new Chat(LeadLanguage.TA, true);
        chat.say("how much?");
        assertEquals(ConversationState.AWAITING_LANGUAGE, chat.state);
        assertTrue(chat.reply().contains("Pricing depends on what you need"));
        assertTrue(chat.reply().contains("கட்டணம் மாறும்"));
    }

    @Test
    void oneUnclearReplyIsRetriedAndASecondHandsOff() {
        Chat chat = new Chat(LeadLanguage.EN, true);
        chat.say("1");

        chat.say("ok");
        assertEquals(ConversationState.AWAITING_BUSINESS_TYPE, chat.state);
        assertTrue(chat.reply().startsWith("Sorry, I didn't catch that."));
        assertTrue(chat.reply().contains("For example"));

        chat.say("hmm");
        assertEquals(ConversationState.HANDED_OFF, chat.state);
        assertTrue(chat.last.updates().handoffRequested());
        assertTrue(chat.reply().contains("A member of the AROORAA team"));
    }

    @Test
    void anAnswerResetsTheUnclearCount() {
        Chat chat = new Chat(LeadLanguage.EN, false);
        chat.say("hello");
        assertEquals(1, chat.unclear);
        chat.say("english");
        assertEquals(0, chat.unclear);
        chat.say("hello");
        assertEquals(ConversationState.AWAITING_REQUIREMENT, chat.state, "first unclear at a new step only retries");
    }

    @Test
    void askingForAPersonHandsOffAndThenTheScriptStaysSilent() {
        Chat chat = new Chat(LeadLanguage.TA, true);
        chat.say("2");
        chat.say("யாராவது பேசுங்க");
        assertEquals(ConversationState.HANDED_OFF, chat.state);
        assertTrue(chat.reply().startsWith("நன்றி. AROORAA team"));

        chat.say("hello?");
        assertTrue(chat.last.replies().isEmpty(), "a person owns the chat now");
        assertEquals(ConversationState.HANDED_OFF, chat.state);
    }

    @Test
    void afterCompletionAPriceQuestionIsAnsweredAndAnythingElseHandsOff() {
        Chat chat = new Chat(LeadLanguage.EN, true);
        chat.say("1");
        chat.say("Bakery");
        chat.say("evening");

        chat.say("what is the price?");
        assertEquals(ConversationState.COMPLETED, chat.state);
        assertEquals("Pricing depends on what you need, so our team will share it after understanding your requirement.",
                chat.reply());

        chat.say("can you also do a logo");
        assertEquals(ConversationState.HANDED_OFF, chat.state);
    }
}
