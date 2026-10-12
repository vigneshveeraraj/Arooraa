package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.conversation.ConversationEngine.LeadUpdates;
import com.arooraa.leads.capture.conversation.ConversationEngine.Snapshot;
import com.arooraa.leads.capture.conversation.ConversationEngine.Turn;
import com.arooraa.leads.capture.conversation.domain.ConversationChannel;
import com.arooraa.leads.capture.conversation.domain.LeadConversation;
import com.arooraa.leads.capture.conversation.domain.LeadConversationMessage;
import com.arooraa.leads.capture.conversation.repository.LeadConversationMessageRepository;
import com.arooraa.leads.capture.conversation.repository.LeadConversationRepository;
import com.arooraa.leads.capture.domain.LeadCapture;
import com.arooraa.leads.capture.domain.LeadSource;
import com.arooraa.leads.capture.repository.LeadCaptureRepository;
import com.arooraa.leads.capture.service.LeadReferenceGenerator;
import com.arooraa.leads.service.IpHasher;
import com.arooraa.leads.service.PhoneNumberNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Handles one inbound message end to end, in one transaction: de-duplicate, find or start the
 * participant's conversation, link it to a lead, run the script, store both sides of the turn.
 * Channel adapters only translate in and out: the local simulator, and the WhatsApp Cloud API
 * transport (capture.whatsapp — off by default, ops/whatsapp-integration.md), whose background
 * processor calls this inside its own transaction so the turn, the inbox row and the reply
 * outbox commit together.
 *
 * Linking a reference: a message carrying "LC-XXXXXX" attaches the conversation to that saved
 * lead <em>only if the lead's phone is the sender's number</em>. Otherwise anyone who saw a
 * reference could write answers into someone else's lead; a mismatched reference is ignored and
 * the sender gets a lead of their own.
 *
 * Logs carry the lead reference and conversation state only — never a phone number or message text.
 */
@Service
public class LeadConversationService {

    private static final Logger log = LoggerFactory.getLogger(LeadConversationService.class);
    private static final Pattern E164 = Pattern.compile("^\\+\\d{8,15}$");

    static final String CHAT_CONSENT_TEXT = "Customer started this conversation by messaging AROORAA.";

    private final LeadConversationRepository conversations;
    private final LeadConversationMessageRepository messages;
    private final LeadCaptureRepository leads;
    private final LeadReferenceGenerator referenceGenerator;
    private final ConversationEngine engine;
    private final OutboundMessageGuard guard;
    private final IpHasher participantHasher;

    public LeadConversationService(LeadConversationRepository conversations, LeadConversationMessageRepository messages,
                                   LeadCaptureRepository leads, LeadReferenceGenerator referenceGenerator,
                                   ConversationEngine engine, OutboundMessageGuard guard, IpHasher participantHasher) {
        this.conversations = conversations;
        this.messages = messages;
        this.leads = leads;
        this.referenceGenerator = referenceGenerator;
        this.engine = engine;
        this.guard = guard;
        this.participantHasher = participantHasher;
    }

    /** {@code participantPhone} is E.164 with a leading "+". {@code externalMessageId} may be null. */
    public record InboundMessage(ConversationChannel channel, String participantPhone, String externalMessageId,
                                 String text) {
    }

    public record OutboundReply(UUID conversationId, UUID messageId, String body) {
    }

    public record Result(boolean duplicate, String leadReference, List<OutboundReply> replies) {
        static Result ofDuplicate() {
            return new Result(true, null, List.of());
        }
    }

    @Transactional
    public Result handle(InboundMessage in) {
        if (!E164.matcher(in.participantPhone()).matches()) {
            throw new IllegalArgumentException("Participant phone must be E.164");
        }
        if (in.externalMessageId() != null && messages.existsByExternalMessageId(in.externalMessageId())) {
            log.info("lead-conversation duplicate delivery ignored channel={}", in.channel());
            return Result.ofDuplicate();
        }
        String text = in.text() == null ? "" : in.text().strip();

        String participantHash = participantHasher.hash(in.channel().name() + ":" + in.participantPhone());
        LeadConversation conversation = conversations.findForUpdate(in.channel(), participantHash).orElse(null);
        boolean isNew = conversation == null;
        if (isNew) {
            conversation = conversations.saveAndFlush(new LeadConversation(in.channel(), participantHash));
        }

        LeadCapture lead = conversation.getLeadCaptureId() == null ? null
                : leads.findById(conversation.getLeadCaptureId()).orElse(null);
        boolean restart = isNew;
        Optional<LeadCapture> referenced = referencedLeadOwnedBy(text, in.participantPhone());
        if (referenced.isPresent() && (lead == null || !referenced.get().getId().equals(lead.getId()))) {
            lead = referenced.get();
            restart = true;
        }
        if (lead == null) {
            lead = leads.save(LeadCapture.fromConversation(referenceGenerator.next(), in.participantPhone(),
                    countryCodeOf(in.participantPhone()), CHAT_CONSENT_TEXT, sourceOf(in.channel())));
            restart = true;
        }
        if (restart) {
            conversation.startFor(lead.getId());
        }
        conversation.recordInbound();

        LeadConversationMessage inbound = messages.save(
                LeadConversationMessage.inbound(conversation.getId(), text.isEmpty() ? "(empty message)" : text,
                        in.externalMessageId()));

        Turn turn = restart
                ? engine.start(lead.getSourceLocale())
                : engine.handle(new Snapshot(conversation.getState(), conversation.getLanguage(), lead.getSourceLocale(),
                        lead.getRequirement() != null, conversation.getUnclearCount()), text);

        conversation.advance(turn.state(), turn.language(), turn.unclearCount());
        applyToLead(lead, turn.updates());
        inbound.recordInterpretation(turn.interpretedBy());

        List<OutboundReply> replies = new ArrayList<>();
        for (String body : turn.replies()) {
            String safe = guard.sanitize(body, turn.language(), lead.getSourceLocale());
            LeadConversationMessage outbound = messages.save(LeadConversationMessage.outbound(conversation.getId(), safe));
            replies.add(new OutboundReply(conversation.getId(), outbound.getId(), safe));
        }

        log.info("lead-conversation turn reference={} channel={} state={} interpretedBy={} replies={}",
                lead.getLeadReference(), in.channel(), turn.state(), turn.interpretedBy(), replies.size());
        return new Result(false, lead.getLeadReference(), replies);
    }

    private Optional<LeadCapture> referencedLeadOwnedBy(String text, String participantPhone) {
        Matcher m = LeadReferenceGenerator.IN_TEXT.matcher(text);
        if (!m.find()) {
            return Optional.empty();
        }
        String reference = "LC-" + m.group(1).toUpperCase(Locale.ROOT);
        Optional<LeadCapture> lead = leads.findByLeadReference(reference);
        if (lead.isPresent() && !lead.get().getPhone().equals(participantPhone)) {
            log.warn("lead-conversation reference not linked reason=PHONE_MISMATCH reference={}", reference);
            return Optional.empty();
        }
        return lead;
    }

    private static void applyToLead(LeadCapture lead, LeadUpdates updates) {
        if (updates.language() != null) {
            lead.choosePreferredLanguage(updates.language());
        }
        if (updates.requirement() != null) {
            lead.answerRequirement(updates.requirement());
        }
        if (updates.businessType() != null) {
            lead.answerBusinessType(updates.businessType());
        }
        if (updates.callTime() != null) {
            lead.answerPreferredCallTime(updates.callTime());
        }
        if (updates.handoffRequested()) {
            lead.requestHandoff();
        }
    }

    private static String countryCodeOf(String e164) {
        return PhoneNumberNormalizer.isValid(e164) ? "IN" : null;
    }

    private static LeadSource sourceOf(ConversationChannel channel) {
        return channel == ConversationChannel.SIMULATOR ? LeadSource.SIMULATOR : LeadSource.WHATSAPP;
    }
}
