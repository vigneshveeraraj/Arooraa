package com.arooraa.aura.discovery;

import com.arooraa.aura.conversation.UnknownConversationException;
import com.arooraa.aura.conversation.domain.AuraConversation;
import com.arooraa.aura.conversation.domain.AuraMessage;
import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.MessageRole;
import com.arooraa.aura.conversation.repository.AuraConversationRepository;
import com.arooraa.aura.conversation.repository.AuraMessageRepository;
import com.arooraa.aura.discovery.config.DiscoveryProperties;
import com.arooraa.aura.discovery.domain.BriefStatus;
import com.arooraa.aura.discovery.domain.ProjectBrief;
import com.arooraa.aura.discovery.domain.ProjectBriefFields;
import com.arooraa.aura.discovery.handoff.EnquiryReceipt;
import com.arooraa.aura.discovery.handoff.HandoffContact;
import com.arooraa.aura.discovery.handoff.HandoffUnavailableException;
import com.arooraa.aura.discovery.handoff.ProjectEnquiryClient;
import com.arooraa.aura.discovery.handoff.ProjectEnquiryMapper;
import com.arooraa.aura.discovery.handoff.ProjectEnquirySubmission;
import com.arooraa.aura.insight.AuraInsightRecorder;
import com.arooraa.aura.insight.domain.AuraEventType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * The brief's whole life: extracted from a conversation, shown to the visitor, corrected by them,
 * and — only with their explicit yes — handed to the Start Project workflow.
 *
 * <h2>What stops this being submitted by accident</h2>
 * Four separate things, and none of them is a check a language model performs.
 *
 * <ul>
 *   <li><b>Consent is a parameter, not an inference.</b> The handoff takes a boolean the browser
 *       sets from an explicit question with two buttons. Nothing else can set it, and giving
 *       contact details is not it.</li>
 *   <li><b>The brief has to have been seen.</b> A handoff is refused unless the brief is
 *       {@code SUMMARISED}, which only happens when a summary is actually returned to the visitor.
 *       Nobody's project is sent to us on the strength of a summary they never read.</li>
 *   <li><b>Re-extracting resets that.</b> Correcting the brief puts it back to {@code DRAFT}, so a
 *       changed brief has to be looked at again before it can be sent.</li>
 *   <li><b>Submitting twice is impossible.</b> The reference is stored on the brief and returned
 *       for any later attempt, and the idempotency key is derived from the conversation, so even a
 *       request that gets past us creates nothing new at the other end.</li>
 * </ul>
 *
 * <p>Contact details are never stored here. They arrive with the handoff request, are validated,
 * mapped and forwarded, and this service keeps no copy — so a conversation database holds project
 * descriptions and no way to attach a name to any of them.
 */
@Service
public class ProjectDiscoveryService {

    private static final Logger log = LoggerFactory.getLogger(ProjectDiscoveryService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** How many turns the pipeline itself answered as PROJECT_DISCOVERY before a summary is offered. */
    private static final int MIN_DISCOVERY_TURNS = 2;

    private final AuraConversationRepository conversationRepository;
    private final AuraMessageRepository messageRepository;
    private final ProjectBriefRepository briefRepository;
    private final ProjectBriefExtractor extractor;
    private final ProjectEnquiryMapper enquiryMapper;
    private final ProjectEnquiryClient enquiryClient;
    private final AuraInsightRecorder insightRecorder;
    private final DiscoveryProperties properties;

    public ProjectDiscoveryService(AuraConversationRepository conversationRepository,
                                    AuraMessageRepository messageRepository,
                                    ProjectBriefRepository briefRepository,
                                    ProjectBriefExtractor extractor,
                                    ProjectEnquiryMapper enquiryMapper,
                                    ProjectEnquiryClient enquiryClient,
                                    AuraInsightRecorder insightRecorder,
                                    DiscoveryProperties properties) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.briefRepository = briefRepository;
        this.extractor = extractor;
        this.enquiryMapper = enquiryMapper;
        this.enquiryClient = enquiryClient;
        this.insightRecorder = insightRecorder;
        this.properties = properties;
    }

    /** What a client needs to render a summary, and nothing about how it was produced. */
    public record BriefView(ProjectBriefFields fields, BriefStatus status, boolean readyToSummarise,
                             boolean handoffAvailable, String enquiryReference) {
    }

    /**
     * Builds or rebuilds the brief and returns it. Called when the visitor asks for a summary, and
     * again after they correct something — re-extraction is how a correction takes effect, because
     * the correction is itself just another thing they said.
     */
    @Transactional
    public BriefView summarise(UUID conversationPublicId) {
        AuraConversation conversation = load(conversationPublicId);
        ProjectBrief existing = briefRepository.findByConversationId(conversation.getId()).orElse(null);

        if (existing != null && existing.isSubmitted()) {
            // Already sent. Re-reading it must not re-extract, because the enquiry a person is
            // holding and the brief it came from have to keep saying the same thing.
            return view(existing, read(existing.getFieldsJson()), true);
        }

        List<AuraMessage> transcript = messageRepository.findByConversationIdOrderBySequenceAsc(conversation.getId());
        if (!readyToSummarise(transcript)) {
            // Not a project conversation yet, or not enough said. Deliberately does not call the
            // extractor: a brief built from one sentence would be mostly nulls, and offering it
            // would make Aura look like it had stopped listening.
            return new BriefView(ProjectBriefFields.empty(), BriefStatus.DRAFT, false,
                    enquiryClient.isEnabled(), null);
        }

        ProjectBriefFields fields = extractor.extract(transcript);
        ProjectBrief brief = existing == null
                ? briefRepository.save(ProjectBrief.draft(conversation.getId(), write(fields)))
                : existing;
        if (existing != null) {
            brief.replaceFields(write(fields));
        }

        if (fields.worthSummarising()) {
            // Marked seen only because it is about to be returned to the visitor. This is the one
            // place that may set SUMMARISED, and it is the gate the handoff checks.
            brief.markSummarised();
            insightRecorder.discovery(AuraEventType.PROJECT_BRIEF_SUMMARISED, conversation.getId());
            if (enquiryClient.isEnabled()) {
                // "Offered" means Aura was in a position to offer, which is the number worth having
                // next to how many were actually sent — and it is distinguishable from the line
                // above precisely when the handoff is switched off.
                insightRecorder.discovery(AuraEventType.PROJECT_HANDOFF_OFFERED, conversation.getId());
            }
        }
        return view(brief, fields, fields.worthSummarising());
    }

    /** Reads the brief without building one. Used to decide whether to offer a summary at all. */
    @Transactional(readOnly = true)
    public BriefView peek(UUID conversationPublicId) {
        AuraConversation conversation = load(conversationPublicId);
        Optional<ProjectBrief> stored = briefRepository.findByConversationId(conversation.getId());
        boolean ready = readyToSummarise(
                messageRepository.findByConversationIdOrderBySequenceAsc(conversation.getId()));

        return stored
                .map(brief -> view(brief, read(brief.getFieldsJson()), ready))
                .orElseGet(() -> new BriefView(ProjectBriefFields.empty(), BriefStatus.DRAFT, ready,
                        enquiryClient.isEnabled(), null));
    }

    /**
     * Creates the Start Project enquiry — the only method in this service that causes anything to
     * happen outside it.
     *
     * @param consent must be true. Not defaulted, not inferred, and not implied by anything else in
     *        the request
     * @throws HandoffRefusedException when consent is absent, the brief has not been seen, or there
     *         is nothing in it worth sending
     */
    @Transactional
    public EnquiryReceipt handOff(UUID conversationPublicId, boolean consent, HandoffContact contact) {
        if (!consent) {
            insightRecorder.discovery(AuraEventType.PROJECT_HANDOFF_REFUSED, null);
            throw new HandoffRefusedException("CONSENT_REQUIRED",
                    "I'll only send this if you'd like me to.");
        }

        AuraConversation conversation = load(conversationPublicId);
        ProjectBrief brief = briefRepository.findByConversationId(conversation.getId())
                .orElseThrow(() -> new HandoffRefusedException("NO_BRIEF",
                        "Let's put together a summary first, so you can see what I'd be sending."));

        if (brief.isSubmitted()) {
            // Not an error. Somebody pressed the button twice, or a request was retried; either way
            // the honest answer is the enquiry that already exists.
            log.info("Aura handoff already submitted for this conversation — returning the existing reference.");
            return new EnquiryReceipt(brief.getEnquiryReference(), "This is already with the team.");
        }
        if (brief.getStatus() != BriefStatus.SUMMARISED) {
            throw new HandoffRefusedException("BRIEF_NOT_REVIEWED",
                    "Let's look over the summary together first.");
        }

        ProjectBriefFields fields = read(brief.getFieldsJson());
        if (!fields.worthSummarising()) {
            throw new HandoffRefusedException("BRIEF_TOO_THIN",
                    "There isn't enough here yet for the team to work from. Tell me a little more?");
        }

        ProjectEnquirySubmission submission = enquiryMapper.map(fields, contact, conversationPublicId);
        // Derived from the conversation, so the same conversation can never create two enquiries
        // even if this service is bypassed entirely and the workflow is called directly.
        EnquiryReceipt receipt = enquiryClient.submit(submission, "aura-" + conversationPublicId);

        brief.markSubmitted(receipt.reference(), Instant.now());
        insightRecorder.discovery(AuraEventType.PROJECT_HANDOFF_CREATED, conversation.getId());
        log.info("Aura handoff created a Start Project enquiry.");
        return receipt;
    }

    private BriefView view(ProjectBrief brief, ProjectBriefFields fields, boolean ready) {
        return new BriefView(fields, brief.getStatus(), ready, enquiryClient.isEnabled(),
                brief.getEnquiryReference());
    }

    /**
     * Whether it is worth offering a summary at all — deliberately answered from stored facts
     * rather than from anything a model decides.
     *
     * <p>Two conditions, and the second is the one that matters. Counting visitor turns alone
     * would offer to write a project brief in the middle of a conversation about MESA's opening
     * hours, because that conversation also has three turns in it. So the pipeline's own verdict is
     * used instead: {@code ConversationMode} is recorded on every assistant turn, and two turns
     * answered as PROJECT_DISCOVERY is a sustained discussion about their project rather than one
     * sentence that happened to mention an idea.
     */
    private boolean readyToSummarise(List<AuraMessage> transcript) {
        long visitorTurns = transcript.stream()
                .filter(message -> message.getRole() == MessageRole.USER)
                .count();
        long discoveryTurns = transcript.stream()
                .filter(message -> message.getMode() == ConversationMode.PROJECT_DISCOVERY)
                .count();
        return visitorTurns >= properties.minVisitorTurns() && discoveryTurns >= MIN_DISCOVERY_TURNS;
    }

    private AuraConversation load(UUID conversationPublicId) {
        return conversationRepository.findByPublicId(conversationPublicId)
                .orElseThrow(() -> new UnknownConversationException(conversationPublicId));
    }

    private String write(ProjectBriefFields fields) {
        return MAPPER.writeValueAsString(fields);
    }

    private ProjectBriefFields read(String json) {
        try {
            return MAPPER.readValue(json, ProjectBriefFields.class);
        } catch (JacksonException e) {
            // A stored brief that cannot be read is a bug, not a visitor's problem. An empty brief
            // means they are asked to summarise again rather than shown an error.
            log.warn("A stored project brief could not be read back — treating it as empty.");
            return ProjectBriefFields.empty();
        }
    }
}
