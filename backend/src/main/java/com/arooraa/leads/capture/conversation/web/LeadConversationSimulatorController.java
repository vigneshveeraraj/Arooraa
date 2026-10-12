package com.arooraa.leads.capture.conversation.web;

import com.arooraa.leads.capture.conversation.LeadConversationService;
import com.arooraa.leads.capture.conversation.LeadConversationService.InboundMessage;
import com.arooraa.leads.capture.conversation.domain.ConversationChannel;
import com.arooraa.leads.capture.exception.FeatureDisabledException;
import com.arooraa.leads.service.PhoneNumberNormalizer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Local development only: drives the same conversation path the WhatsApp transport uses, without
 * Meta, so the script and the local model can be tried end to end. Nothing is sent anywhere —
 * replies come back in the response.
 *
 * Off unless BOTH arooraa.lead-conversation.simulator.enabled=true AND a token of at least 24
 * characters is configured and sent as X-Simulator-Token — enforced by
 * {@link LeadConversationSimulatorGate} before the body is read, and checked again here. A
 * client-IP check is deliberately not used: behind the local Nginx every request arrives from
 * 127.0.0.1, and X-Forwarded-For can be forged. Must never be enabled in production.
 */
@RestController
@RequestMapping("/api/v1/lead-conversations/simulator")
public class LeadConversationSimulatorController {

    private final LeadConversationService service;
    private final LeadConversationSimulatorGate gate;

    public LeadConversationSimulatorController(LeadConversationService service, LeadConversationSimulatorGate gate) {
        this.service = service;
        this.gate = gate;
    }

    public record SimulatedMessage(String phone, String text) {
    }

    public record SimulatedTurn(String leadReference, List<String> replies) {
    }

    @PostMapping("/messages")
    public ResponseEntity<SimulatedTurn> send(
            @RequestHeader(value = LeadConversationSimulatorGate.TOKEN_HEADER, required = false) String presentedToken,
            @RequestBody SimulatedMessage message) {
        if (!gate.isAuthorized(presentedToken)) {
            throw new FeatureDisabledException();
        }
        if (!PhoneNumberNormalizer.isValid(message.phone()) || message.text() == null || message.text().isBlank()
                || message.text().length() > 1000) {
            return ResponseEntity.badRequest().build();
        }
        LeadConversationService.Result result = service.handle(new InboundMessage(ConversationChannel.SIMULATOR,
                PhoneNumberNormalizer.normalize(message.phone()), null, message.text()));
        return ResponseEntity.ok(new SimulatedTurn(result.leadReference(),
                result.replies().stream().map(LeadConversationService.OutboundReply::body).toList()));
    }
}
