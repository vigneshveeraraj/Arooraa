package com.arooraa.aura.conversation;

import com.arooraa.aura.conversation.config.ChatProperties;
import com.arooraa.aura.conversation.domain.AuraConversation;
import com.arooraa.aura.conversation.domain.AuraMessage;
import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.ConversationTone;
import com.arooraa.aura.conversation.domain.Language;
import com.arooraa.aura.conversation.language.LanguageDetector;
import com.arooraa.aura.conversation.language.ToneDetector;
import com.arooraa.aura.conversation.pipeline.AuraAnswer;
import com.arooraa.aura.conversation.pipeline.ComposedPrompt;
import com.arooraa.aura.conversation.pipeline.ConversationContext;
import com.arooraa.aura.conversation.pipeline.ConversationContextLoader;
import com.arooraa.aura.conversation.pipeline.GenerationDecision;
import com.arooraa.aura.conversation.pipeline.GenerationPolicy;
import com.arooraa.aura.conversation.pipeline.GuardrailResult;
import com.arooraa.aura.conversation.pipeline.InputValidator;
import com.arooraa.aura.conversation.pipeline.OutputGuardrail;
import com.arooraa.aura.conversation.pipeline.PromptComposer;
import com.arooraa.aura.conversation.pipeline.ResponseAssembler;
import com.arooraa.aura.conversation.pipeline.RetrievalDecision;
import com.arooraa.aura.conversation.pipeline.RetrievalPlanner;
import com.arooraa.aura.conversation.pipeline.SafeResponses;
import com.arooraa.aura.conversation.pipeline.ScopeDecision;
import com.arooraa.aura.conversation.pipeline.ScopeClassifier;
import com.arooraa.aura.conversation.profile.AssistantProfileDefinition;
import com.arooraa.aura.conversation.profile.AssistantProfileResolver;
import com.arooraa.aura.conversation.repository.AuraConversationRepository;
import com.arooraa.aura.conversation.repository.AuraMessageRepository;
import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.ChatGenerationRequest;
import com.arooraa.aura.provider.ChatGenerationResult;
import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import com.arooraa.aura.retrieval.EvidenceLevel;
import com.arooraa.aura.retrieval.HybridRetrievalService;
import com.arooraa.aura.retrieval.RetrievalRequest;
import com.arooraa.aura.retrieval.RetrievalResult;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * The conversation pipeline, in order. Owns sequencing and nothing else — every decision belongs
 * to the stage that made it, and this class refuses to second-guess any of them.
 *
 * <pre>
 *   validate → resolve profile → classify scope → classify confidentiality → load context
 *   → decide retrieval → retrieve → evidence gate → generation policy → compose prompt
 *   → generate → guardrail → assemble
 * </pre>
 *
 * <p>Two ordering choices are load-bearing rather than incidental. Classification happens
 * <em>before</em> retrieval, so a confidentiality boundary is decided without any corpus content in
 * play. And the guardrail runs on every path out, including the fallbacks — a safe answer that
 * skips the last check is not a safe answer.
 */
@Service
public class ConversationOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(ConversationOrchestrator.class);

    private final InputValidator inputValidator;
    private final AssistantProfileResolver profileResolver;
    private final ScopeClassifier scopeClassifier;
    private final LanguageDetector languageDetector;
    private final ToneDetector toneDetector;
    private final ConversationContextLoader contextLoader;
    private final RetrievalPlanner retrievalPlanner;
    private final HybridRetrievalService retrievalService;
    private final GenerationPolicy generationPolicy;
    private final PromptComposer promptComposer;
    private final ChatGenerationProvider chatProvider;
    private final OutputGuardrail outputGuardrail;
    private final ResponseAssembler responseAssembler;
    private final AuraConversationRepository conversationRepository;
    private final AuraMessageRepository messageRepository;
    private final ChatProperties properties;
    private final Timer turnLatencyTimer;

    public ConversationOrchestrator(InputValidator inputValidator,
                                     AssistantProfileResolver profileResolver,
                                     ScopeClassifier scopeClassifier,
                                     LanguageDetector languageDetector,
                                     ToneDetector toneDetector,
                                     ConversationContextLoader contextLoader,
                                     RetrievalPlanner retrievalPlanner,
                                     HybridRetrievalService retrievalService,
                                     GenerationPolicy generationPolicy,
                                     PromptComposer promptComposer,
                                     ChatGenerationProvider chatProvider,
                                     OutputGuardrail outputGuardrail,
                                     ResponseAssembler responseAssembler,
                                     AuraConversationRepository conversationRepository,
                                     AuraMessageRepository messageRepository,
                                     ChatProperties properties,
                                     MeterRegistry meterRegistry) {
        this.inputValidator = inputValidator;
        this.profileResolver = profileResolver;
        this.scopeClassifier = scopeClassifier;
        this.languageDetector = languageDetector;
        this.toneDetector = toneDetector;
        this.contextLoader = contextLoader;
        this.retrievalPlanner = retrievalPlanner;
        this.retrievalService = retrievalService;
        this.generationPolicy = generationPolicy;
        this.promptComposer = promptComposer;
        this.chatProvider = chatProvider;
        this.outputGuardrail = outputGuardrail;
        this.responseAssembler = responseAssembler;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.properties = properties;
        this.turnLatencyTimer = meterRegistry.timer("aura.conversation.turn.latency");
    }

    @Transactional
    public AuraAnswer respond(AuraConversation conversation, String rawMessage, String currentPath) {
        long startedAt = System.nanoTime();
        return turnLatencyTimer.record(() -> handle(conversation, rawMessage, currentPath, startedAt));
    }

    private AuraAnswer handle(AuraConversation conversation, String rawMessage, String currentPath, long startedAt) {
        // 1. Input validation — before anything costs money or touches the model.
        String message = inputValidator.validate(rawMessage);

        // 2. Assistant profile resolution. Fails closed: an unrecognised profile gets no
        //    capabilities rather than the website assistant's.
        AssistantProfileDefinition profile = profileResolver.resolve(conversation.getAssistantProfile())
                .orElseThrow(() -> new IllegalStateException(
                        "Unknown assistant profile on conversation: " + conversation.getAssistantProfile()));

        // 3 + 4. Scope and confidentiality classification, both deterministic.
        ScopeDecision scope = scopeClassifier.classify(message);
        ConversationMode mode = scope.mode();
        Language language = languageDetector.detect(message);
        ConversationTone tone = toneDetector.detect(message);

        // 5. Conversation context (bounded).
        ConversationContext context = contextLoader.load(conversation.getId());
        int sequence = (int) messageRepository.countByConversationId(conversation.getId());
        messageRepository.save(AuraMessage.userTurn(conversation.getId(), sequence, message, language, tone));
        sequence++;

        // 6 + 7 + 8. Retrieval decision, hybrid retrieval, and the A2.2 evidence gate.
        RetrievalDecision retrievalDecision = retrievalPlanner.decide(mode);
        RetrievalResult retrieval = retrievalDecision.retrieve()
                ? retrievalService.retrieve(new RetrievalRequest(message, profile.profile(), profile.channel()))
                : RetrievalResult.noEvidence(message);

        // 9. Generation policy: what this turn may claim.
        GenerationDecision decision = generationPolicy.decide(mode, retrieval.evidenceLevel(), tone);

        // 10. Prompt/policy composition.
        ComposedPrompt prompt = promptComposer.compose(profile, mode, language, tone, decision,
                retrieval.evidence(), context, currentPath, message);

        // 11. Generation, with every failure path ending in something Aura would plausibly say.
        String generated;
        String failureCode = null;
        if (!chatProvider.isEnabled()) {
            generated = SafeResponses.providerDisabled(language);
            failureCode = "PROVIDER_DISABLED";
        } else {
            try {
                ChatGenerationResult result = chatProvider.generate(new ChatGenerationRequest(
                        prompt.messages(), properties.temperature(), properties.maxOutputTokens()));
                generated = result.content();
            } catch (ProviderTransientException | ProviderPermanentException e) {
                // The exception's code is safe to log (see the provider adapter); its cause is not
                // rendered to the visitor under any circumstances.
                log.warn("Chat generation failed ({}) — answering with a safe fallback.", e.getMessage());
                generated = SafeResponses.providerUnavailable(language);
                failureCode = "PROVIDER_FAILURE";
            }
        }

        // 12. Output guardrail — runs on generated answers and fallbacks alike.
        GuardrailResult guarded = outputGuardrail.check(generated, prompt.policyText(), mode, language, decision);
        String violation = failureCode != null ? failureCode : guarded.violationCode();

        // 13. Response assembly. Sources are attached only where the policy allowed grounding and
        //     the answer survived the guardrail intact — a blocked answer cites nothing.
        boolean includeSources = decision.includeSources() && !guarded.replaced() && failureCode == null;
        conversation.touch();
        conversationRepository.save(conversation);

        long latencyMs = (System.nanoTime() - startedAt) / 1_000_000;
        AuraAnswer answer = responseAssembler.assemble(conversation.getPublicId(), conversation.getId(), sequence,
                guarded.text(), mode, effectiveEvidenceLevel(retrieval, guarded), language, tone,
                retrieval.evidence(), includeSources, latencyMs, violation);

        log.info("Aura turn: mode={} evidence={} language={} tone={} sources={} guardrail={} latencyMs={}",
                mode, answer.evidenceLevel(), language, tone, answer.sources().size(),
                violation == null ? "clean" : violation, latencyMs);
        return answer;
    }

    /**
     * A blocked answer reports NO_EVIDENCE regardless of what retrieval found: the evidence level
     * describes what the visitor was actually told, and they were told nothing grounded.
     */
    private EvidenceLevel effectiveEvidenceLevel(RetrievalResult retrieval, GuardrailResult guarded) {
        return guarded.replaced() ? EvidenceLevel.NO_EVIDENCE : retrieval.evidenceLevel();
    }

    /** Exposed for the API layer's history endpoint — the orchestrator owns no read model of its own. */
    public List<AuraMessage> transcript(AuraConversation conversation) {
        return messageRepository.findByConversationIdOrderBySequenceAsc(conversation.getId());
    }
}
