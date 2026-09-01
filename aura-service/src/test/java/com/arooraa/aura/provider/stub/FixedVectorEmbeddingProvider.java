package com.arooraa.aura.provider.stub;

import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.EmbeddingResult;

import java.util.HashMap;
import java.util.Map;

/**
 * Test-only provider that returns exactly the vector registered for a given text, so a test can
 * dictate the precise cosine similarity between a query and a chunk.
 *
 * <p>{@link #unitVectorAtAngle} builds unit vectors in the first two dimensions, so registering a
 * chunk at angle 0 and a query at angle θ gives a cosine similarity of exactly {@code cos θ}. That
 * makes it possible to test the evidence gate's strong/borderline/none bands against a real
 * pgvector similarity search rather than against a mock — the bands are the thing under test, and
 * a hash-based stub could not place a query in a chosen band on purpose.
 *
 * <p>Lives under {@code src/test}: like every fake in this module, it must never be shippable.
 */
public class FixedVectorEmbeddingProvider implements EmbeddingProvider {

    public static final int DIMENSIONS = 1536;

    private final Map<String, float[]> vectorsByText = new HashMap<>();

    public void register(String text, float[] vector) {
        if (vector.length != DIMENSIONS) {
            throw new IllegalArgumentException("expected " + DIMENSIONS + " dimensions, got " + vector.length);
        }
        vectorsByText.put(text, vector);
    }

    /** Unit vector at {@code radians} from the first axis — cosine similarity with angle 0 is exactly cos(radians). */
    public static float[] unitVectorAtAngle(double radians) {
        float[] vector = new float[DIMENSIONS];
        vector[0] = (float) Math.cos(radians);
        vector[1] = (float) Math.sin(radians);
        return vector;
    }

    /** Cosine similarity of {@code cos} against a vector registered at angle 0. */
    public static float[] unitVectorWithSimilarity(double cosine) {
        return unitVectorAtAngle(Math.acos(Math.max(-1.0, Math.min(1.0, cosine))));
    }

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
        float[] vector = vectorsByText.get(text);
        if (vector == null) {
            throw new IllegalStateException("No vector registered for text: \"" + text + "\"");
        }
        return new EmbeddingResult(vector, "fixed-vector-test-model", "fixed-vector-test");
    }
}
