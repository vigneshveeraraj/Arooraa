package com.arooraa.aura.knowledge.persistence;

import com.pgvector.PGvector;

/**
 * Renders a Java {@code float[]} as the pgvector text literal ({@code [0.1,0.2,...]}) so a native
 * query can bind it as a plain string parameter and {@code CAST(:param AS vector)} it — the same
 * text format {@link VectorType} already reads on the way out, so the round trip is consistent.
 */
public final class VectorLiteral {

    private VectorLiteral() {
    }

    public static String of(float[] vector) {
        return new PGvector(vector).getValue();
    }
}
