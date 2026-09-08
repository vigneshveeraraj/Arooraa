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
import com.arooraa.aura.conversation.pipeline.DiscoveryContinuityResolver;
import com.arooraa.aura.conversation.pipeline.GenerationDecision;
import com.arooraa.aura.conversation.pipeline.GenerationPolicy;
import com.arooraa.aura.conversation.pipeline.GuardrailResult;
import com.arooraa.aura.conversation.pipeline.InputValidator;
import com.arooraa.aura.conversation.pipeline.OutputGuardrail;
import com.arooraa.aura.conversation.pipeline.PageAwareScopeResolver;
import com.arooraa.aura.conversation.pipeline.PromptComposer;
import com.arooraa.aura.conversation.pipeline.ResponseAssembler;
import com.arooraa.aura.conversation.pipeline.RetrievalDecision;
import com.arooraa.aura.conversation.pipeline.RetrievalPlanner;
import com.arooraa.aura.conversation.pipeline.SafeResponses;
import com.arooraa.aura.conversation.pipeline.ScopeDecision;
import com.arooraa.aura.conversation.pipeline.ScopeClassifier;
import com.arooraa.aura.conversation.pipeline.BusinessRoutingResolver;
import com.arooraa.aura.conversation.pipeline.ExternalRecommendation;
import com.arooraa.aura.conversation.domain.ResponseAction;
import com.arooraa.aura.conversation.pipeline.SubjectOnlyQuery;
import com.arooraa.aura.conversation.profile.AssistantProfileDefinition;
import com.arooraa.aura.conversation.profile.AssistantProfileResolver;
import com.arooraa.aura.conversation.repository.AuraConversationRepository;
import com.arooraa.aura.conversation.repository.AuraMessageRepository;
import com.arooraa.aura.insight.AuraInsightRecorder;
import com.arooraa.aura.insight.KnowledgeGapDetector;
import com.arooraa.aura.insight.domain.AuraEventType;
import com.arooraa.aura.protection.DailyCallBudget;
import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.ChatGenerationRequest;
import com.arooraa.aura.provider.ChatGenerationResult;
import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import com.arooraa.aura.retrieval.EvidenceLevel;
import com.arooraa.aura.retrieval.HybridRetrievalService;
import com.arooraa.aura.retrieval.RetrievalRequest;
import com.arooraa.aura.retrieval.RetrievalResult;
import com.arooraa.aura.vocabulary.EntityResolution;
import com.arooraa.aura.vocabulary.PublicEntityResolver;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * The conversation pipeline, in order. Owns sequencing and nothing else — every decision belongs
 * to the stage that made it, and this class refuses to second-guess any of them.
 *
 * <pre>
 *   validate → recognise public entities → resolve profile → classify scope
 *   → classify confidentiality → load context → decide retrieval → retrieve → evidence gate
 *   → generation policy → compose prompt → generate → guardrail → assemble
 * </pre>
 *
 * <p>Three ordering choices are load-bearing rather than incidental. Classification happens
 * <em>before</em> retrieval, so a confidentiality boundary is decided without any corpus content in
 * play. The guardrail runs on every path out, including the fallbacks — a safe answer that skips
 * the last check is not a safe answer. And entity recognition (A5.2) happens before classification
 * rather than before retrieval, because by retrieval time the routing decision that skipped
 * retrieval has already been taken: "tell me about meesa" names no organisation subject, so it
 * lands in the general fallback and never searches anything.
 *
 * <p>A turn is addressed by conversation id, never by a conversation object. That is a persistence
 * rule, not a style preference: see {@link #respond}.
 */
@Service
public class ConversationOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(ConversationOrchestrator.class);

    private final InputValidator inputValidator;
    private final PublicEntityResolver entityResolver;
    private final AssistantProfileResolver profileResolver;
    private final ScopeClassifier scopeClassifier;
    private final PageAwareScopeResolver pageAwareScopeResolver;
    private final DiscoveryContinuityResolver discoveryContinuityResolver;
    private final BusinessRoutingResolver businessRoutingResolver;
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
    private final DailyCallBudget budget;
    private final AuraInsightRecorder insightRecorder;
    private final KnowledgeGapDetector knowledgeGapDetector;
    private final ChatProperties properties;
    private final Timer turnLatencyTimer;

    public ConversationOrchestrator(InputValidator inputValidator,
                                     PublicEntityResolver entityResolver,
                                     AssistantProfileResolver profileResolver,
                                     ScopeClassifier scopeClassifier,
                                     PageAwareScopeResolver pageAwareScopeResolver,
                                     DiscoveryContinuityResolver discoveryContinuityResolver,
                                    BusinessRoutingResolver businessRoutingResolver,
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
                                     DailyCallBudget budget,
                                     AuraInsightRecorder insightRecorder,
                                     KnowledgeGapDetector knowledgeGapDetector,
                                     ChatProperties properties,
                                     MeterRegistry meterRegistry) {
        this.inputValidator = inputValidator;
        this.entityResolver = entityResolver;
        this.profileResolver = profileResolver;
        this.scopeClassifier = scopeClassifier;
        this.pageAwareScopeResolver = pageAwareScopeResolver;
        this.discoveryContinuityResolver = discoveryContinuityResolver;
        this.businessRoutingResolver = businessRoutingResolver;
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
        this.budget = budget;
        this.insightRecorder = insightRecorder;
        this.knowledgeGapDetector = knowledgeGapDetector;
        this.properties = properties;
        this.turnLatencyTimer = meterRegistry.timer("aura.conversation.turn.latency");
    }

    /**
     * Answers one turn.
     *
     * <p>Takes the conversation's public id rather than a loaded {@code AuraConversation}, and this
     * is the fix for the A3.2 optimistic-lock defect rather than an incidental refactor. An entity
     * handed in from outside is detached — the transaction it was loaded in has already committed —
     * and {@code save()} on a detached instance is a {@code merge()}, which returns a <em>new</em>
     * managed copy while leaving the caller's object holding the version it was loaded with. A
     * caller that kept the object (the real-provider script does exactly that) therefore merged a
     * stale version on its second turn and got {@code ObjectOptimisticLockingFailureException}.
     *
     * <p>Loading inside this transaction makes that impossible by construction: the instance is
     * managed for the whole turn, so its version is always the row's current version and the
     * update at the end is Hibernate's own dirty check rather than a merge of somebody's copy. No
     * entity crosses a transaction boundary, so none can go stale. Optimistic locking is untouched
     * and still does its real job — two turns racing on the same conversation both load version N,
     * and the second to flush is rejected. There is no retry anywhere in this path; a stale write
     * is meant to be visible, not smoothed over.
     */
    @Transactional
    public AuraAnswer respond(UUID conversationId, String rawMessage, String currentPath) {
        long startedAt = System.nanoTime();
        AuraConversation conversation = load(conversationId);
        return turnLatencyTimer.record(() -> handle(conversation, rawMessage, currentPath, startedAt));
    }

    private AuraAnswer handle(AuraConversation conversation, String rawMessage, String currentPath, long startedAt) {
        // 1. Input validation — before anything costs money or touches the model.
        String message = inputValidator.validate(rawMessage);

        // 1.5 (A5.2). The same words, with AROORAA's own public names spelled AROORAA's way. This
        //     is what the deterministic stages below read; `message` — the visitor's own words — is
        //     what is stored, what the model is shown as the user's turn, and what a knowledge gap
        //     records. Nothing outside the registry is ever touched, and nothing here decides what
        //     Aura may say: a recognised MESA still has to survive the confidentiality boundary,
        //     the evidence gate and the guardrail, and it makes the first of those stricter rather
        //     than weaker, since "what database does Meesa use?" now reads as the probe it is.
        EntityResolution entities = entityResolver.resolve(message, currentPath);
        String understood = entities.canonicalText();

        // 2. Assistant profile resolution. Fails closed: an unrecognised profile gets no
        //    capabilities rather than the website assistant's.
        AssistantProfileDefinition profile = profileResolver.resolve(conversation.getAssistantProfile())
                .orElseThrow(() -> new IllegalStateException(
                        "Unknown assistant profile on conversation: " + conversation.getAssistantProfile()));

        // 3 + 4. Scope and confidentiality classification, both deterministic.
        ScopeDecision scope = scopeClassifier.classify(understood);
        // 3.5 (A4.1). "Tell me more about this." names nothing on its own — only page context can
        // resolve it. Only ever narrows the GENERAL_CONSULTING fallback; see the resolver's own
        // doc for exactly which three conditions all have to hold before it changes anything.
        PageAwareScopeResolver.Resolution pageContext = pageAwareScopeResolver.resolve(scope, understood, currentPath);
        scope = pageContext.scope();
        // 3.6 (A6). "Right now they use WhatsApp groups" is an answer to Aura's own question and
        // names nothing on its own either — so a project discussion keeps being one. Runs after 3.5
        // so that a page-anchored question mid-discussion is still answered about the page.
        scope = discoveryContinuityResolver.resolve(scope, conversation.getId());
        // 3.7 (A1.5). "Can you help me guide how to code?" matched no phrase in any list and fell
        // through to GENERAL_CONSULTING, where it was answered as a tutoring request complete with
        // three external learning platforms. Nobody had established whether this person wanted to
        // learn or wanted something built. This asks, and only ever narrows that same fallback.
        BusinessRoutingResolver.Routing routing = businessRoutingResolver.resolve(scope.mode(), understood);
        if (routing.mode() != scope.mode()) {
            scope = new ScopeDecision(routing.mode(), scope.confidentiality(), scope.mentionsOrganisationSubject());
        }
        ResponseAction action = routing.action();
        ConversationMode mode = scope.mode();
        Language language = languageDetector.detect(message);
        ConversationTone tone = toneDetector.detect(message);

        // 5. Conversation context (bounded).
        ConversationContext context = contextLoader.load(conversation.getId());
        int sequence = (int) messageRepository.countByConversationId(conversation.getId());
        messageRepository.save(AuraMessage.userTurn(conversation.getId(), sequence, message, language, tone));
        sequence++;

        // 6 + 7 + 8. Retrieval decision, hybrid retrieval, and the A2.2 evidence gate.
        // The retrieval query is contextualized when 3.5 fired above; the visitor's own message
        // (stored, and what the model sees as the user's turn) is never touched.
        RetrievalDecision retrievalDecision = retrievalPlanner.decide(scope);
        // 7.5 (A5.2.4). "mesa uses?" is a subject and nothing else. Searched literally it embeds
        // mostly filler and lands on the evidence gate's floor, so it is searched for as what it
        // asks about instead — the same repair 3.5 makes for "tell me more about this", for the
        // same reason. Anything with content of its own is left exactly as the visitor wrote it;
        // see SubjectOnlyQuery for why that restraint is the whole safety of this.
        String retrievalQuery = SubjectOnlyQuery.contextualize(
                pageContext.retrievalQuery(), entities.canonicalNames());
        RetrievalResult retrieval = retrievalDecision.retrieve()
                ? retrievalService.retrieve(new RetrievalRequest(retrievalQuery, profile.profile(), profile.channel()))
                : RetrievalResult.noEvidence(message);

        // 9. Generation policy: what this turn may claim.
        // Naming an outside platform is unlocked only by the visitor asking for one.
        boolean askedForResources = ExternalRecommendation.requestedBy(message);
        GenerationDecision decision = generationPolicy.decide(mode, retrieval.evidenceLevel(), tone,
                askedForResources);

        // 10. Prompt/policy composition.
        ComposedPrompt prompt = promptComposer.compose(profile, mode, language, tone, decision,
                retrieval.evidence(), context, currentPath, message, entities.canonicalNames(), action);

        // 11. Generation, with every failure path ending in something Aura would plausibly say.
        String generated;
        String failureCode = null;
        if (!chatProvider.isEnabled()) {
            generated = SafeResponses.providerDisabled(language);
            failureCode = "PROVIDER_DISABLED";
        } else if (!budget.tryConsume(DailyCallBudget.Kind.CHAT)) {
            // Today's ceiling is reached (A8). The same path a switched-off provider takes, and
            // deliberately so: the visitor hears a sentence Aura would say and learns nothing about
            // AROORAA's spending, which is not their business.
            generated = SafeResponses.providerUnavailable(language);
            failureCode = "BUDGET_EXHAUSTED";
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
        // No save() call: `conversation` is managed by this transaction, so marking it changes the
        // row through Hibernate's dirty check at commit — and the @Version column is bumped by that
        // same flush, against the version actually read a few milliseconds ago.
        conversation.touch();

        long latencyMs = (System.nanoTime() - startedAt) / 1_000_000;
        AuraAnswer answer = responseAssembler.assemble(conversation.getPublicId(), conversation.getId(), sequence,
                guarded.text(), mode, effectiveEvidenceLevel(retrieval, guarded), language, tone,
                retrieval.evidence(), includeSources, latencyMs, violation, entities.canonicalNames());

        // 14 (A7). Counted, not logged in full: what kind of turn it was and how it went, never a
        // word of what was asked or answered. Both calls swallow their own failures — analytics
        // must never be the reason a visitor's turn fails, and this runs inside its transaction.
        insightRecorder.messageAnswered(conversation.getId(), mode.name(), answer.evidenceLevel().name(),
                language.name(), profile.channel().code(), pageContext.resolvedSubject(), latencyMs);
        if (guarded.replaced()) {
            insightRecorder.guardrailIntervened(conversation.getId(), guarded.violationCode());
        }
        if (failureCode != null) {
            insightRecorder.providerFailed(conversation.getId(), failureCode);
        }
        if (mode == ConversationMode.PROJECT_DISCOVERY) {
            insightRecorder.discovery(AuraEventType.PROJECT_DISCOVERY_STARTED, conversation.getId());
        }
        // A question about AROORAA that our own knowledge could not answer. Nothing recorded here
        // ever becomes knowledge on its own — see KnowledgeGapDetector for what does and does not
        // count, and in particular why a confidentiality boundary emphatically does not.
        knowledgeGapDetector.observe(conversation.getId(), message, mode, answer.evidenceLevel(),
                profile.profile().code(), pageContext.resolvedSubject());

        // Our own product names are safe to log; a visitor's words are not, and none appear here.
        log.info("Aura turn: mode={} evidence={} language={} tone={} entities={} sources={} guardrail={} latencyMs={}",
                mode, answer.evidenceLevel(), language, tone, entities.canonicalNames(),
                answer.sources().size(), violation == null ? "clean" : violation, latencyMs);
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
    @Transactional(readOnly = true)
    public List<AuraMessage> transcript(UUID conversationId) {
        return messageRepository.findByConversationIdOrderBySequenceAsc(load(conversationId).getId());
    }

    private AuraConversation load(UUID conversationId) {
        return conversationRepository.findByPublicId(conversationId)
                .orElseThrow(() -> new UnknownConversationException(conversationId));
    }
}
