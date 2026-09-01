package com.arooraa.aura.conversation.language;

import com.arooraa.aura.conversation.domain.ConversationTone;
import com.arooraa.aura.conversation.pipeline.TextSignals;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * How the visitor sounds, so Aura can match them. Deterministic on purpose: the milestone's rule
 * is not to spend a separate LLM call on emotion, and this signal only steers delivery — getting
 * it wrong makes Aura slightly misjudge the room, not say something unsafe.
 *
 * <p>Order encodes what matters most to get right. {@link ConversationTone#SERIOUS} and
 * {@link ConversationTone#FRUSTRATED} are checked first because they are the two that switch
 * humour off ({@link ConversationTone#suppressesHumour()}); a missed joke costs nothing, a joke
 * landing on a security incident or an angry visitor costs a lot.
 */
@Component
public class ToneDetector {

    /** Situations where levity is never appropriate, regardless of how the message is phrased. */
    private static final List<String> SERIOUS = List.of(
            "security", "breach", "hacked", "vulnerability", "incident", "outage", "down",
            "data loss", "lost data", "legal", "lawsuit", "sue", "contract dispute", "refund",
            "complaint", "escalate", "urgent", "emergency", "critical", "gdpr", "compliance",
            "leaked", "fraud", "scam");

    private static final List<String> FRUSTRATED = List.of(
            "frustrated", "frustrating", "annoyed", "annoying", "angry", "fed up", "terrible",
            "horrible", "useless", "worst", "hate", "waste of time", "not working", "doesn t work",
            "does not work", "broken", "still failing", "again and again", "disappointed", "poor",
            "slow and", "tired of");

    private static final List<String> CONFUSED = List.of(
            "confused", "confusing", "don t understand", "do not understand", "didn t understand",
            "not clear", "unclear", "what do you mean", "i m lost", "makes no sense", "huh");

    private static final List<String> EXCITED = List.of(
            "excited", "can t wait", "amazing", "awesome", "brilliant", "love it", "crazy idea",
            "big idea", "let s go", "finally", "super");

    private static final List<String> HAPPY = List.of(
            "thanks", "thank you", "thankyou", "nice", "great", "perfect", "helpful", "appreciate",
            "cool", "good", "romba nandri", "nandri", "super ah");

    private static final List<String> TECHNICAL = List.of(
            "architecture", "api", "apis", "database", "latency", "throughput", "scaling", "scale",
            "microservices", "kubernetes", "docker", "queue", "cache", "caching", "integration",
            "webhook", "schema", "migration", "deployment", "rag", "embedding", "vector",
            "authentication", "authorization", "encryption", "performance", "index", "sql");

    private static final List<String> CASUAL = List.of(
            "hi", "hii", "hey", "hello", "yo", "bro", "machan", "dude", "sup", "vanakkam", "hola");

    /** Enthusiasm markers that ride along with an otherwise plain sentence. */
    private static final List<String> POSITIVE_EMOJI = List.of("😄", "😀", "😊", "🙂", "🎉", "🔥", "❤", "👍");

    public ConversationTone detect(String message) {
        if (message == null || message.isBlank()) {
            return ConversationTone.NEUTRAL;
        }
        String text = TextSignals.normalize(message);

        if (TextSignals.containsAny(text, SERIOUS)) {
            return ConversationTone.SERIOUS;
        }
        if (TextSignals.containsAny(text, FRUSTRATED)) {
            return ConversationTone.FRUSTRATED;
        }
        if (TextSignals.containsAny(text, CONFUSED)) {
            return ConversationTone.CONFUSED;
        }
        if (TextSignals.containsAny(text, EXCITED) || message.contains("!!")) {
            return ConversationTone.EXCITED;
        }
        if (TextSignals.containsAny(text, HAPPY) || containsAny(message, POSITIVE_EMOJI)) {
            return ConversationTone.HAPPY;
        }
        if (TextSignals.containsAny(text, TECHNICAL)) {
            return ConversationTone.TECHNICAL;
        }
        if (TextSignals.containsAny(text, CASUAL)) {
            return ConversationTone.CASUAL;
        }
        if (message.trim().endsWith("?")) {
            return ConversationTone.CURIOUS;
        }
        return ConversationTone.NEUTRAL;
    }

    /** Emoji are matched on the raw message — {@code TextSignals.normalize} strips them by design. */
    private static boolean containsAny(String raw, List<String> needles) {
        for (String needle : needles) {
            if (raw.contains(needle)) {
                return true;
            }
        }
        return false;
    }
}
