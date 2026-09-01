package com.arooraa.aura.provider.stub;

import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.EmbeddingResult;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Deterministic, test-only fake — deliberately lives under {@code src/test}, never shippable in
 * the production jar, so it can never be accidentally enabled in a real deployment (see
 * ProviderConfiguration's Javadoc on why no fake ships in {@code src/main}). Same 1536
 * dimensionality as the real {@code vector(1536)} column (V1), so tests exercise the actual
 * production column width, not a toy size.
 *
 * <p>A2: upgraded from a whole-string hash (independent-looking vectors regardless of shared
 * vocabulary) to a bag-of-words hashing-trick embedding — each lowercased word hashes into one of
 * {@value #DIMENSIONS} buckets and increments it, then the vector is L2-normalized. Two texts
 * sharing words end up with genuinely closer vectors, so vector-search tests and the retrieval
 * acceptance harness exercise real (if crude) semantic clustering without any network call or API
 * key. It has no real cross-lingual understanding — for Tamil/Tanglish text it can only match on
 * literal shared tokens (e.g. a product name typed the same way in both query and document); see
 * the A2 final report's Tamil/Tanglish baseline for what that means in practice.
 */
public class StubEmbeddingProvider implements EmbeddingProvider {

    private static final int DIMENSIONS = 1536;
    private static final Pattern WORD = Pattern.compile("[\\p{L}\\p{Nd}]+");

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
        var matcher = WORD.matcher(text.toLowerCase(Locale.ROOT));
        while (matcher.find()) {
            String word = matcher.group();
            int bucket = Math.floorMod(word.hashCode(), DIMENSIONS);
            vector[bucket] += 1f;
        }
        normalize(vector);
        return new EmbeddingResult(vector, "stub-embedding-model", "stub");
    }

    private static void normalize(float[] vector) {
        double sumSquares = 0;
        for (float v : vector) {
            sumSquares += (double) v * v;
        }
        if (sumSquares == 0) {
            return;
        }
        float norm = (float) Math.sqrt(sumSquares);
        for (int i = 0; i < vector.length; i++) {
            vector[i] /= norm;
        }
    }
}
