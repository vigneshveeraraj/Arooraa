package com.arooraa.aura.conversation.api;

import com.arooraa.aura.conversation.ConversationOrchestrator;
import com.arooraa.aura.conversation.ConversationService;
import com.arooraa.aura.conversation.UnknownAssistantProfileException;
import com.arooraa.aura.conversation.config.ChatProperties;
import com.arooraa.aura.conversation.domain.AuraConversation;
import com.arooraa.aura.conversation.pipeline.AuraAnswer;
import com.arooraa.aura.conversation.pipeline.InvalidInputException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * The local chat API — the surface the owner talks to Aura through during manual acceptance.
 *
 * <p>Conditional on {@code aura.chat.enabled}, which defaults to false. When it is off this bean
 * does not exist, so the routes 404 rather than merely refusing: A3 is a local milestone, and a
 * chat endpoint that is merely "not advertised" in production is not the same thing as one that is
 * not there.
 *
 * <p>The profile is chosen when a conversation opens and pinned to it; per-message requests carry
 * only the message and an optional page context. That keeps a client from re-declaring its own
 * routing context on every turn.
 */
@RestController
@RequestMapping("/api/v1/aura/conversations")
@ConditionalOnProperty(prefix = "aura.chat", name = "enabled", havingValue = "true")
public class AuraChatController {

    private final ConversationService conversationService;
    private final ConversationOrchestrator orchestrator;
    private final ChatProperties properties;

    public AuraChatController(ConversationService conversationService,
                               ConversationOrchestrator orchestrator,
                               ChatProperties properties) {
        this.conversationService = conversationService;
        this.orchestrator = orchestrator;
        this.properties = properties;
    }

    @PostMapping
    public ResponseEntity<ChatDtos.CreateConversationResponse> create(
            @RequestBody(required = false) ChatDtos.CreateConversationRequest request) {
        String requestedProfile = request == null ? null : request.assistantProfile();
        AuraConversation conversation = conversationService.open(requestedProfile);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ChatDtos.CreateConversationResponse(
                conversation.getPublicId(), conversation.getAssistantProfile(), conversation.getChannel()));
    }

    @PostMapping("/{conversationId}/messages")
    public ChatDtos.ChatResponse send(@PathVariable UUID conversationId,
                                       @RequestBody ChatDtos.SendMessageRequest request) {
        AuraConversation conversation = conversationService.find(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        AuraAnswer answer = orchestrator.respond(conversation,
                request == null ? null : request.message(),
                request == null ? null : request.currentPath());
        return ChatDtos.ChatResponse.from(answer, properties.diagnosticsEnabled());
    }

    @GetMapping("/{conversationId}")
    public ChatDtos.TranscriptResponse transcript(@PathVariable UUID conversationId) {
        AuraConversation conversation = conversationService.find(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        return new ChatDtos.TranscriptResponse(conversation.getPublicId(),
                orchestrator.transcript(conversation).stream()
                        .map(message -> new ChatDtos.TranscriptMessage(
                                message.getRole().name(),
                                message.getContent(),
                                message.getCreatedAt(),
                                message.getMode() == null ? null : message.getMode().name()))
                        .toList());
    }

    /** Input problems are the visitor's to fix, so the message is theirs to read. */
    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ChatDtos.ErrorResponse> handleInvalidInput(InvalidInputException e) {
        return ResponseEntity.badRequest().body(new ChatDtos.ErrorResponse(e.getCode(), e.getMessage()));
    }

    @ExceptionHandler(UnknownAssistantProfileException.class)
    public ResponseEntity<ChatDtos.ErrorResponse> handleUnknownProfile(UnknownAssistantProfileException e) {
        return ResponseEntity.badRequest().body(
                new ChatDtos.ErrorResponse("UNKNOWN_ASSISTANT_PROFILE", "That assistant profile is not available."));
    }
}
