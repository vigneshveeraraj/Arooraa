package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.config.ChatProperties;
import com.arooraa.aura.conversation.domain.AuraMessage;
import com.arooraa.aura.conversation.domain.AuraMessageSource;
import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.ConversationTone;
import com.arooraa.aura.conversation.domain.Language;
import com.arooraa.aura.conversation.repository.AuraMessageRepository;
import com.arooraa.aura.conversation.repository.AuraMessageSourceRepository;
import com.arooraa.aura.knowledge.domain.KnowledgeSpaces;
import com.arooraa.aura.retrieval.Evidence;
import com.arooraa.aura.retrieval.EvidenceLevel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Pipeline stage 13. Persists the assistant turn and turns evidence into visitor-safe citations.
 *
 * <p>The knowledge-space filter here is redundant on purpose. Retrieval already refuses to return
 * anything outside the profile's authorized spaces, in SQL — but citations are the one place
 * retrieved material becomes visible output, so it is worth failing closed twice. If the first
 * boundary were ever weakened, a policy document still could not be cited.
 */
@Component
public class ResponseAssembler {

    private final AuraMessageRepository messageRepository;
    private final AuraMessageSourceRepository sourceRepository;
    private final ChatProperties properties;

    public ResponseAssembler(AuraMessageRepository messageRepository,
                              AuraMessageSourceRepository sourceRepository,
                              ChatProperties properties) {
        this.messageRepository = messageRepository;
        this.sourceRepository = sourceRepository;
        this.properties = properties;
    }

    public AuraAnswer assemble(UUID conversationPublicId, UUID conversationId, int sequence, String answerText,
                                ConversationMode mode, EvidenceLevel evidenceLevel, Language language,
                                ConversationTone tone, List<Evidence> evidence, boolean includeSources,
                                long latencyMs, String guardrailViolation) {
        List<SourceReference> sources = includeSources ? toSources(evidence) : List.of();

        AuraMessage stored = messageRepository.save(AuraMessage.assistantTurn(
                conversationId, sequence, answerText, language, tone, mode, evidenceLevel.name()));

        int position = 0;
        for (SourceReference source : sources) {
            sourceRepository.save(new AuraMessageSource(
                    stored.getId(), position++, source.title(), source.section(), source.sourceUrl()));
        }

        return new AuraAnswer(conversationPublicId, answerText, mode, evidenceLevel, sources,
                language, tone, latencyMs, guardrailViolation);
    }

    /**
     * One citation per document, in evidence order. Several chunks of the same document routinely
     * rank together; showing "MESA, MESA, MESA" would be noise, so the first (best-ranked) section
     * heading represents the document.
     */
    private List<SourceReference> toSources(List<Evidence> evidence) {
        Map<String, SourceReference> byDocument = new LinkedHashMap<>();
        for (Evidence item : evidence) {
            if (!KnowledgeSpaces.AROORAA_PUBLIC.equals(item.knowledgeSpace())) {
                continue;
            }
            byDocument.putIfAbsent(item.documentSlug(),
                    new SourceReference(item.documentTitle(), item.sectionHeading(), item.sourceUrl()));
        }
        List<SourceReference> sources = new ArrayList<>(byDocument.values());
        return sources.size() > properties.maxSources()
                ? List.copyOf(sources.subList(0, properties.maxSources()))
                : List.copyOf(sources);
    }
}
