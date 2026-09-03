package com.arooraa.aura.insight;

import com.arooraa.aura.conversation.UnknownConversationException;
import com.arooraa.aura.conversation.domain.AuraConversation;
import com.arooraa.aura.conversation.domain.AuraMessage;
import com.arooraa.aura.conversation.domain.MessageRole;
import com.arooraa.aura.conversation.repository.AuraConversationRepository;
import com.arooraa.aura.conversation.repository.AuraMessageRepository;
import com.arooraa.aura.insight.domain.AuraFeedback;
import com.arooraa.aura.insight.domain.FeedbackRating;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Recording whether an answer was any use.
 *
 * <p>Two things are checked before anything is written, and both are about the turn rather than
 * the visitor. The conversation has to exist, and the sequence has to name an answer Aura actually
 * gave in it — so feedback cannot be attached to a turn that never happened, to somebody else's
 * conversation, or to the visitor's own message.
 *
 * <p>The reason is bounded to 300 characters at the edge. It is the one place in this whole
 * subsystem where a visitor's free text is stored, and it is stored because "not helpful" without
 * a reason tells you that something is wrong and nothing about what.
 */
@Service
public class FeedbackService {

    /** Long enough for a sentence, short enough that it stays a reason rather than a conversation. */
    private static final int MAX_REASON_CHARS = 300;

    private final AuraConversationRepository conversations;
    private final AuraMessageRepository messages;
    private final AuraFeedbackRepository feedback;
    private final AuraInsightRecorder recorder;

    public FeedbackService(AuraConversationRepository conversations, AuraMessageRepository messages,
                            AuraFeedbackRepository feedback, AuraInsightRecorder recorder) {
        this.conversations = conversations;
        this.messages = messages;
        this.feedback = feedback;
        this.recorder = recorder;
    }

    /**
     * @throws UnknownConversationException if the conversation is not ours to write against
     * @throws UnknownTurnException if that sequence is not an answer in it
     */
    @Transactional
    public void record(UUID conversationPublicId, int messageSequence, FeedbackRating rating, String reason) {
        AuraConversation conversation = conversations.findByPublicId(conversationPublicId)
                .orElseThrow(() -> new UnknownConversationException(conversationPublicId));

        boolean isAnAnswer = messages.findByConversationIdOrderBySequenceAsc(conversation.getId()).stream()
                .anyMatch(message -> message.getSequence() == messageSequence
                        && message.getRole() == MessageRole.ASSISTANT);
        if (!isAnAnswer) {
            throw new UnknownTurnException(messageSequence);
        }

        String trimmed = trim(reason);
        feedback.findByConversationIdAndMessageSequence(conversation.getId(), messageSequence)
                .ifPresentOrElse(
                        // Changing your mind updates the row. A count of "not helpful" should be a
                        // count of answers people were unhappy with, not of clicks.
                        existing -> existing.revise(rating, trimmed),
                        () -> feedback.save(AuraFeedback.of(
                                conversation.getId(), messageSequence, rating, trimmed)));

        recorder.feedbackGiven(conversation.getId(), rating.name());
    }

    private String trim(String reason) {
        if (reason == null) return null;
        String stripped = reason.strip();
        if (stripped.isEmpty()) return null;
        return stripped.length() <= MAX_REASON_CHARS ? stripped : stripped.substring(0, MAX_REASON_CHARS);
    }

    /** That sequence is not an answer Aura gave in this conversation. */
    public static class UnknownTurnException extends RuntimeException {
        public UnknownTurnException(int sequence) {
            super("No assistant turn at sequence " + sequence);
        }
    }
}
