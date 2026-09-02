package com.arooraa.aura.voice;

import com.arooraa.aura.conversation.UnknownConversationException;
import com.arooraa.aura.conversation.domain.AuraConversation;
import com.arooraa.aura.conversation.domain.AuraMessage;
import com.arooraa.aura.conversation.domain.Language;
import com.arooraa.aura.conversation.domain.MessageRole;
import com.arooraa.aura.conversation.repository.AuraConversationRepository;
import com.arooraa.aura.conversation.repository.AuraMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Decides <em>what</em> Aura speaks, so that {@link VoiceService} only has to decide how.
 *
 * <p>The important design choice in the whole voice-output path is here: a caller cannot send
 * text to be spoken. It names a conversation, and optionally a turn within it, and this service
 * reads the answer out of the transcript. Three things follow, none of which a "speak this string"
 * endpoint could offer:
 *
 * <ul>
 *   <li>what is heard is necessarily what was said — the same row the visitor is reading, not a
 *       paraphrase, a re-generation, or anything a client chose to put in a request body;</li>
 *   <li>Aura cannot be used as a free text-to-speech service by anyone who finds the URL, because
 *       the only strings it will ever speak are ones it already generated;</li>
 *   <li>and the reply's language comes from the stored turn, so a Tamil answer is spoken with a
 *       Tamil hint without the client having to be trusted to say so.</li>
 * </ul>
 */
@Service
public class SpokenAnswerService {

    private final AuraConversationRepository conversationRepository;
    private final AuraMessageRepository messageRepository;
    private final VoiceService voiceService;

    public SpokenAnswerService(AuraConversationRepository conversationRepository,
                                AuraMessageRepository messageRepository,
                                VoiceService voiceService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.voiceService = voiceService;
    }

    /**
     * @param sequence the turn to speak, or null for the most recent thing Aura said — which is
     *        what both "speak this answer" and "say that again" ask for
     * @throws UnknownConversationException if the conversation is not this service's to read.
     *         Deliberately indistinguishable from "no such id": a caller learns nothing about
     *         whether a conversation exists by asking us to speak from it
     */
    @Transactional(readOnly = true)
    public VoiceService.Speech speak(UUID conversationId, Integer sequence) {
        AuraConversation conversation = conversationRepository.findByPublicId(conversationId)
                .orElseThrow(() -> new UnknownConversationException(conversationId));

        AuraMessage answer = locate(conversation.getId(), sequence)
                .orElseThrow(() -> new InvalidAudioException("NOTHING_TO_SPEAK",
                        "There's nothing for me to say yet."));

        return voiceService.speak(answer.getContent(), languageHint(answer.getLanguage()));
    }

    private Optional<AuraMessage> locate(UUID conversationId, Integer sequence) {
        return messageRepository.findByConversationIdOrderBySequenceAsc(conversationId).stream()
                .filter(message -> message.getRole() == MessageRole.ASSISTANT)
                .filter(message -> sequence == null || message.getSequence() == sequence)
                .reduce((first, second) -> second);
    }

    /**
     * Tanglish is Tamil spoken with English words in it, and is written in Latin script — a "ta"
     * hint would have a synthesizer read Latin letters as if they were transliterated Tamil. It is
     * left unhinted so the voice reads it the way it is written, which is how it is said.
     */
    private String languageHint(Language language) {
        if (language == Language.TAMIL) return "ta";
        if (language == Language.ENGLISH) return "en";
        return null;
    }
}
