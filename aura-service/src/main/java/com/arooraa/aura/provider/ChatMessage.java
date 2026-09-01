package com.arooraa.aura.provider;

/** One turn in a chat-generation request. {@code role} is provider-neutral: "system"/"user"/"assistant". */
public record ChatMessage(String role, String content) {
}
