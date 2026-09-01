package com.arooraa.aura.provider;

import java.util.List;

/**
 * A text-embedding backend, abstracted away from any single vendor. Provider selection is
 * configuration-driven; see {@code aura.provider.embedding.*}.
 */
public interface EmbeddingProvider {

    /** False when no real provider is configured — callers must check this before embedding. */
    boolean isEnabled();

    /** The dimensionality this provider produces — must match the {@code aura_embeddings.embedding} column width. */
    int dimensions();

    /**
     * @throws ProviderDisabledException if {@link #isEnabled()} is false.
     */
    EmbeddingResult embed(String text);

    /**
     * Batch form — implementations may override for efficiency; the default just calls
     * {@link #embed(String)} per item.
     *
     * @throws ProviderDisabledException if {@link #isEnabled()} is false.
     */
    default List<EmbeddingResult> embedBatch(List<String> texts) {
        return texts.stream().map(this::embed).toList();
    }
}
