package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.provider.ChatMessage;

import java.util.List;

/**
 * What gets sent to the model for one turn: the rendered system instruction plus the full message
 * list (system, bounded history, current turn).
 *
 * <p>{@code policyText} is the same instruction <em>minus the approved-material section</em>, and
 * it exists for the output guardrail. The guardrail detects instruction leakage by looking for
 * verbatim word runs from the prompt in the answer — but a grounded answer is *supposed* to track
 * the evidence closely, so including that section would turn every good answer into a suspected
 * leak. Policy text is the part that must never come back out.
 */
public record ComposedPrompt(String systemText, String policyText, List<ChatMessage> messages) {
}
