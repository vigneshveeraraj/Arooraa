package com.arooraa.aura.conversation.api;

import com.arooraa.aura.conversation.pipeline.AuraAnswer;
import com.arooraa.aura.conversation.pipeline.SourceReference;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * The wire contract for the local chat API. Every type here is deliberately small: what a client
 * receives is the answer, its public sources, and — only when diagnostics are switched on — the
 * routing metadata a developer needs while testing.
 *
 * <p>Nothing in this file can carry a document id, a similarity score, a threshold, a knowledge
 * space, evidence text or prompt text. That is enforced by omission rather than by filtering:
 * there is no field for them to travel in.
 */
public final class ChatDtos {

    private ChatDtos() {
    }

    public record CreateConversationRequest(String assistantProfile) {
    }

    public record CreateConversationResponse(UUID conversationId, String assistantProfile, String channel) {
    }

    /**
     * @param currentPath optional page the visitor is on ("/products/mesa"). Context only — it
     *        never grants access to anything and never widens what may be retrieved
     */
    public record SendMessageRequest(String message, String currentPath) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ChatResponse(
            UUID conversationId,
            /** Which turn this is. The only thing a client needs in order to give feedback on it. */
            int sequence,
            String answer,
            List<Source> sources,
            Diagnostics diagnostics) {

        public static ChatResponse from(AuraAnswer answer, boolean includeDiagnostics) {
            return new ChatResponse(
                    answer.conversationId(),
                    answer.sequence(),
                    answer.answer(),
                    answer.sources().stream().map(Source::from).toList(),
                    includeDiagnostics ? Diagnostics.from(answer) : null);
        }
    }

    public record Source(String title, String section, String sourceUrl) {

        static Source from(SourceReference reference) {
            return new Source(reference.title(), reference.section(), reference.sourceUrl());
        }
    }

    /**
     * Local developer diagnostics. Present only when {@code aura.chat.diagnostics-enabled=true},
     * and even then limited to routing outcomes — never the prompt, the evidence text, or anything
     * about how retrieval scored.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Diagnostics(String mode, String evidenceLevel, String language, String tone,
                               long latencyMs, String guardrail) {

        static Diagnostics from(AuraAnswer answer) {
            return new Diagnostics(
                    answer.mode().name(),
                    answer.evidenceLevel().name(),
                    answer.language().name(),
                    answer.tone().name(),
                    answer.latencyMs(),
                    answer.guardrailViolation());
        }
    }

    public record TranscriptResponse(UUID conversationId, List<TranscriptMessage> messages) {
    }

    public record TranscriptMessage(String role, String content, Instant at, String mode) {
    }

    public record ErrorResponse(String code, String message) {
    }
}
