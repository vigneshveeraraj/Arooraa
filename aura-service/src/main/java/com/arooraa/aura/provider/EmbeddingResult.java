package com.arooraa.aura.provider;

/**
 * {@code provider} names which {@link EmbeddingProvider} implementation produced this vector
 * (e.g. "openai", "stub") — carried on the result itself so callers (like {@code IngestionService})
 * can persist real provenance without ever branching on a provider name (frozen architecture
 * requirement: no scattered provider-name branching in business code).
 */
public record EmbeddingResult(float[] vector, String model, String provider) {
}
