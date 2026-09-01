package com.arooraa.aura.provider.openai;

/** OpenAI-specific — deliberately confined to this package, never referenced outside {@code provider.openai} (frozen architecture requirement). */
record OpenAiEmbeddingRequest(String model, String input) {
}
