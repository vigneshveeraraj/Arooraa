package com.arooraa.aura.provider.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Backed by {@code aura.provider.*} — all external, never hardcoded (matches this repository's
 * {@code arooraa.*}/{@code AROORAA_*} convention, here {@code aura.*}/{@code AURA_*}). No
 * provider is enabled by default: production is safe with zero AI configuration present.
 */
@ConfigurationProperties(prefix = "aura.provider")
public record ProviderProperties(Chat chat, Embedding embedding, Reranking reranking) {

    /** {@code provider} selects the real adapter to wire when enabled, exactly as for embeddings. */
    public record Chat(boolean enabled, String provider, String model, int timeoutSeconds) {
    }

    /**
     * {@code provider} selects which real adapter to wire when enabled (e.g. "openai") — a config
     * value, never a business-code branch (frozen architecture requirement). {@code generation}
     * identifies the vector cohort this configuration produces and reads: ingestion writes
     * embeddings at this generation and retrieval only ever searches it, so switching provider or
     * model means bumping the generation and re-embedding rather than mixing incomparable vectors
     * in one similarity search.
     */
    public record Embedding(boolean enabled, String provider, String model, int dimensions, int timeoutSeconds,
                             int generation) {
    }

    public record Reranking(boolean enabled, String model, int timeoutSeconds) {
    }
}
