package com.arooraa.aura.discovery.api;

import com.arooraa.aura.conversation.UnknownConversationException;
import com.arooraa.aura.discovery.HandoffRefusedException;
import com.arooraa.aura.discovery.ProjectDiscoveryService;
import com.arooraa.aura.discovery.handoff.EnquiryReceipt;
import com.arooraa.aura.discovery.handoff.HandoffUnavailableException;
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * The project brief's HTTP surface — read it, rebuild it, and send it.
 *
 * <p>Deliberately three separate routes rather than one that does whatever seems appropriate. A
 * summary is a read; rebuilding one is an explicit act; sending it is a third, and the only one
 * that has an effect a person outside this conversation will see. Nothing here can be reached by
 * anything Aura says — the model has no tools, and these routes are called by the browser in
 * response to a visitor pressing something.
 *
 * <p>Conditional on {@code aura.chat.enabled}, like the chat surface it belongs to.
 */
@RestController
@RequestMapping("/api/v1/aura/conversations/{conversationId}/brief")
@ConditionalOnProperty(prefix = "aura.chat", name = "enabled", havingValue = "true")
public class AuraBriefController {

    private final ProjectDiscoveryService discoveryService;

    public AuraBriefController(ProjectDiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }

    /** What we have, without building anything. Cheap enough to call whenever the panel opens. */
    @GetMapping
    public BriefDtos.BriefResponse peek(@PathVariable UUID conversationId) {
        return BriefDtos.BriefResponse.from(discoveryService.peek(conversationId));
    }

    /**
     * Builds the brief from the conversation and returns it. Also the correction path: a visitor
     * who tells Aura it got something wrong has simply said another thing, and asking for the
     * summary again is what makes that count.
     */
    @PostMapping
    public BriefDtos.BriefResponse summarise(@PathVariable UUID conversationId) {
        return BriefDtos.BriefResponse.from(discoveryService.summarise(conversationId));
    }

    /**
     * Creates the Start Project enquiry. Requires {@code consent: true} in the body — a field with
     * no default, so a request that forgets to mention it is refused rather than assumed.
     */
    @PostMapping("/handoff")
    public BriefDtos.HandoffResponse handOff(@PathVariable UUID conversationId,
                                              @Valid @RequestBody BriefDtos.HandoffRequest request) {
        EnquiryReceipt receipt = discoveryService.handOff(
                conversationId, Boolean.TRUE.equals(request.consent()), request.contact());
        return new BriefDtos.HandoffResponse(receipt.reference());
    }

    /** Consent missing, brief unseen, or nothing in it worth sending — all the visitor's to resolve. */
    @ExceptionHandler(HandoffRefusedException.class)
    public ResponseEntity<BriefDtos.ErrorResponse> handleRefused(HandoffRefusedException e) {
        return ResponseEntity.badRequest().body(new BriefDtos.ErrorResponse(e.getCode(), e.getMessage()));
    }

    /** Ours — the Start Project workflow is switched off or would not answer. */
    @ExceptionHandler(HandoffUnavailableException.class)
    public ResponseEntity<BriefDtos.ErrorResponse> handleUnavailable(HandoffUnavailableException e) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new BriefDtos.ErrorResponse(e.getCode(), e.getMessage()));
    }

    /**
     * A contact detail the visitor needs to fix. The field name is returned so the form can point
     * at it; the message is the constraint's own, which is why every constraint in
     * {@code HandoffContact} is phrased as something a person would want to read.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BriefDtos.ErrorResponse> handleInvalidContact(MethodArgumentNotValidException e) {
        FieldError first = e.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        String field = first == null ? null : first.getField().replace("contact.", "");
        String message = first == null ? "Something in those details didn't look right." : first.getDefaultMessage();
        return ResponseEntity.badRequest().body(new BriefDtos.ErrorResponse("INVALID_CONTACT", message, field));
    }

    /** Says nothing about whether the identifier is malformed, expired or simply someone else's. */
    @ExceptionHandler(UnknownConversationException.class)
    public ResponseEntity<BriefDtos.ErrorResponse> handleUnknownConversation(UnknownConversationException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new BriefDtos.ErrorResponse("CONVERSATION_NOT_FOUND", "That conversation isn't available."));
    }
}
