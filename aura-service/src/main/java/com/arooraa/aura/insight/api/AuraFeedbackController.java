package com.arooraa.aura.insight.api;

import com.arooraa.aura.conversation.UnknownConversationException;
import com.arooraa.aura.insight.FeedbackService;
import com.arooraa.aura.insight.domain.FeedbackRating;
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * "Was that any use?" — one route, and the only part of the insight subsystem a visitor can reach.
 *
 * <p>It writes and returns nothing. A visitor telling us an answer was unhelpful should get a
 * quiet acknowledgement, not a response body describing what we recorded about them; and there is
 * deliberately no way to read feedback back, so this endpoint cannot be used to find out what
 * anyone else thought.
 */
@RestController
@RequestMapping("/api/v1/aura/conversations/{conversationId}/messages/{sequence}/feedback")
@ConditionalOnProperty(prefix = "aura.chat", name = "enabled", havingValue = "true")
public class AuraFeedbackController {

    private final FeedbackService feedbackService;

    public AuraFeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<Void> record(@PathVariable UUID conversationId,
                                        @PathVariable int sequence,
                                        @Valid @RequestBody InsightDtos.FeedbackRequest request) {
        feedbackService.record(conversationId, sequence,
                FeedbackRating.valueOf(request.rating()), request.reason());
        return ResponseEntity.noContent().build();
    }

    /**
     * Both "no such conversation" and "no such turn" answer 404, and say the same thing. A visitor
     * gets nothing from this endpoint that would help them find out which conversations or turns
     * exist.
     */
    @ExceptionHandler({UnknownConversationException.class, FeedbackService.UnknownTurnException.class})
    public ResponseEntity<InsightDtos.ErrorResponse> handleUnknown(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new InsightDtos.ErrorResponse("NOT_FOUND", "That isn't available."));
    }
}
