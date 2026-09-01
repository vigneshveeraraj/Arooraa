package com.arooraa.aura.conversation.pipeline;

/** Whether to search approved knowledge for this turn, and the reason — recorded for diagnostics. */
public record RetrievalDecision(boolean retrieve, String reason) {
}
