package com.arooraa.aura.provider;

/** {@code candidateIndex} refers back into the original candidate list passed to {@link RerankingProvider#rerank}. */
public record RerankedResult(int candidateIndex, double score) {
}
