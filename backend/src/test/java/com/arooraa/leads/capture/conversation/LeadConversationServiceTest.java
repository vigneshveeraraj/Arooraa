package com.arooraa.leads.capture.conversation;

import com.arooraa.leads.capture.conversation.LeadConversationService.InboundMessage;
import com.arooraa.leads.capture.conversation.LeadConversationService.Result;
import com.arooraa.leads.capture.conversation.domain.ConversationChannel;
import com.arooraa.leads.capture.conversation.domain.ConversationState;
import com.arooraa.leads.capture.conversation.domain.LeadConversation;
import com.arooraa.leads.capture.conversation.domain.LeadConversationMessage;
import com.arooraa.leads.capture.conversation.model.DisabledModelReplyClassifier;
import com.arooraa.leads.capture.conversation.repository.LeadConversationMessageRepository;
import com.arooraa.leads.capture.conversation.repository.LeadConversationRepository;
import com.arooraa.leads.capture.domain.ConsentSource;
import com.arooraa.leads.capture.domain.LeadCapture;
import com.arooraa.leads.capture.domain.LeadLanguage;
import com.arooraa.leads.capture.domain.LeadRequirement;
import com.arooraa.leads.capture.domain.LeadSource;
import com.arooraa.leads.capture.domain.PreferredCallTime;
import com.arooraa.leads.capture.repository.LeadCaptureRepository;
import com.arooraa.leads.capture.service.LeadReferenceGenerator;
import com.arooraa.leads.service.IpHasher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** The service against in-memory repositories, so a whole conversation can be replayed message by message. */
class LeadConversationServiceTest {

    private static final String PHONE = "+919876543210";

    private final Map<UUID, LeadCapture> leadStore = new HashMap<>();
    private final Map<String, LeadConversation> conversationStore = new HashMap<>();
    private LeadConversationMessageRepository messages;
    private LeadConversationService service;

    @BeforeEach
    void setUp() {
        LeadCaptureRepository leads = mock(LeadCaptureRepository.class);
        when(leads.save(any(LeadCapture.class))).thenAnswer(i -> {
            LeadCapture lead = i.getArgument(0);
            leadStore.put(lead.getId(), lead);
            return lead;
        });
        when(leads.findById(any())).thenAnswer(i -> Optional.ofNullable(leadStore.get(i.<UUID>getArgument(0))));
        when(leads.findByLeadReference(anyString())).thenAnswer(i -> leadStore.values().stream()
                .filter(l -> l.getLeadReference().equals(i.getArgument(0))).findFirst());

        LeadConversationRepository conversations = mock(LeadConversationRepository.class);
        when(conversations.saveAndFlush(any(LeadConversation.class))).thenAnswer(i -> {
            LeadConversation c = i.getArgument(0);
            conversationStore.put(c.getChannel() + c.getParticipantHash(), c);
            return c;
        });
        when(conversations.findForUpdate(any(), anyString()))
                .thenAnswer(i -> Optional.ofNullable(conversationStore.get(i.getArgument(0).toString() + i.getArgument(1))));

        messages = mock(LeadConversationMessageRepository.class);
        when(messages.save(any(LeadConversationMessage.class))).thenAnswer(i -> i.getArgument(0));

        LeadReferenceGenerator references = mock(LeadReferenceGenerator.class);
        when(references.next()).thenReturn("LC-NEWREF", "LC-NEWRF2");

        RuleBasedReplyInterpreter rules = new RuleBasedReplyInterpreter();
        ConversationEngine engine = new ConversationEngine(new ReplyInterpreter(rules, new DisabledModelReplyClassifier()), rules);
        service = new LeadConversationService(conversations, messages, leads, references, engine,
                new OutboundMessageGuard(), new IpHasher("test-secret-test-secret-test-secret"));
    }

    private LeadCapture webLead(String reference, String phone) {
        LeadCapture lead = LeadCapture.fromWebForm(reference, LeadRequirement.WEBSITE, phone, "consent sentence",
                LeadLanguage.EN, new LeadCapture.Attribution(null, null, null, null, null, null), "ip");
        leadStore.put(lead.getId(), lead);
        return lead;
    }

    private Result send(String text) {
        return service.handle(new InboundMessage(ConversationChannel.SIMULATOR, PHONE, null, text));
    }

    @Test
    void aMessageWithTheSendersOwnReferenceContinuesTheirSavedLead() {
        LeadCapture lead = webLead("LC-7Q2M9X", PHONE);

        Result first = send("Hi AROORAA, I need help with Website. Reference: lc-7q2m9x");
        assertEquals("LC-7Q2M9X", first.leadReference());
        assertTrue(first.replies().getFirst().body().startsWith("Welcome to AROORAA!"));

        send("2");
        assertEquals(LeadLanguage.TA, lead.getPreferredLanguage());
        assertEquals(LeadLanguage.EN, lead.getSourceLocale(), "the page locale is kept, the choice is separate");

        Result third = send("Saree shop");
        assertEquals("எங்கள் team உங்களை எப்போது அழைக்கலாம்? காலை, மதியம் அல்லது மாலை?", third.replies().getFirst().body());
        send("kaalai");

        assertEquals("Saree shop", lead.getBusinessType());
        assertEquals(PreferredCallTime.MORNING, lead.getPreferredCallTime());
        assertEquals(LeadRequirement.WEBSITE, lead.getRequirement(), "not asked again");
        assertEquals(1, leadStore.size(), "no extra lead created");
    }

    @Test
    void someoneElsesReferenceIsIgnoredAndTheSenderGetsALeadOfTheirOwn() {
        LeadCapture victim = webLead("LC-7Q2M9X", "+919000000001");

        Result result = send("LC-7Q2M9X");
        send("1");

        assertEquals("LC-NEWREF", result.leadReference());
        assertEquals(null, victim.getPreferredLanguage(), "the other person's lead is never touched");
        LeadCapture own = leadStore.values().stream().filter(l -> l.getLeadReference().equals("LC-NEWREF")).findFirst().orElseThrow();
        assertEquals(PHONE, own.getPhone());
        assertEquals(ConsentSource.CUSTOMER_INITIATED_CHAT, own.getConsentSource());
        assertEquals(LeadSource.SIMULATOR, own.getSource());
        assertEquals(LeadLanguage.EN, own.getPreferredLanguage());
    }

    @Test
    void aRedeliveredMessageIsANoOp() {
        when(messages.existsByExternalMessageId("wamid.1")).thenReturn(true);

        Result result = service.handle(new InboundMessage(ConversationChannel.WHATSAPP, PHONE, "wamid.1", "hello"));

        assertTrue(result.duplicate());
        assertTrue(result.replies().isEmpty());
        verify(messages, never()).save(any());
    }

    @Test
    void theParticipantIsStoredOnlyAsAHash() {
        send("hello");
        LeadConversation conversation = conversationStore.values().iterator().next();
        assertNotEquals(PHONE, conversation.getParticipantHash());
        assertTrue(!conversation.getParticipantHash().contains("9876543210"));
        assertEquals(ConversationState.AWAITING_LANGUAGE, conversation.getState());
    }

    @Test
    void rejectsANonE164Participant() {
        assertThrows(IllegalArgumentException.class,
                () -> service.handle(new InboundMessage(ConversationChannel.SIMULATOR, "9876543210", null, "hi")));
    }
}
