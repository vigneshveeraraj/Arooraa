package com.arooraa.aura.provider.stub;

import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.EmbeddingResult;

import java.util.Locale;

/**
 * Deterministic, test-only fake — deliberately lives under {@code src/test}, never shippable in
 * the production jar, so it can never be accidentally enabled in a real deployment (see
 * ProviderConfiguration's Javadoc on why no fake ships in {@code src/main}). Produces a vector
 * derived from the text's hash at the same 1536 dimensionality as the real {@code vector(1536)}
 * column (V1), so tests exercise the actual production column width, not a toy size.
 */
public class StubEmbeddingProvider implements EmbeddingProvider {

    private static final int DIMENSIONS = 1536;

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public int dimensions() {
        return DIMENSIONS;
    }

    @Override
    public EmbeddingResult embed(String text) {
        float[] vector = new float[DIMENSIONS];
        int seed = text.toLowerCase(Locale.ROOT).hashCode();
        for (int i = 0; i < DIMENSIONS; i++) {
            vector[i] = ((seed >>> (i * 4)) & 0xF) / 16f;
        }
        return new EmbeddingResult(vector, "stub-embedding-model");
    }
}
