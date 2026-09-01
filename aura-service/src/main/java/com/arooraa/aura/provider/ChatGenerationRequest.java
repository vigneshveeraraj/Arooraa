package com.arooraa.aura.provider;

import java.util.List;

/**
 * Provider-neutral chat-generation request. {@code maxOutputTokens} is a hard cap, not a
 * suggestion — every call site is expected to set one (safety baseline: bounded output size).
 */
public record ChatGenerationRequest(List<ChatMessage> messages, double temperature, int maxOutputTokens) {
}
