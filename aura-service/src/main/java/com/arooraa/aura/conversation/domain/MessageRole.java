package com.arooraa.aura.conversation.domain;

/**
 * Who produced a stored turn. There is deliberately no {@code SYSTEM} role: the composed system
 * prompt and policy text are never persisted (see V4's header comment), so no stored message can
 * ever leak them back out through conversation history.
 */
public enum MessageRole {

    USER,
    ASSISTANT
}
