package com.arooraa.aura.provider.disabled;

import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.EmbeddingResult;
import com.arooraa.aura.provider.ProviderDisabledException;

/** Production-safe default when no embedding provider is configured — the application must still start and stay healthy. */
public class DisabledEmbeddingProvider implements EmbeddingProvider {

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public int dimensions() {
        return 0;
    }

    @Override
    public EmbeddingResult embed(String text) {
        throw new ProviderDisabledException("Embedding provider is not configured.");
    }
}
