package com.arooraa.aura.retrieval.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Backed by {@code aura.retrieval.*}.
 *
 * <p>{@code evidence} thresholds are absolute-relevance thresholds (A2.1) — they are compared
 * against raw cosine similarity and query-term coverage, never against an RRF score. See
 * {@code EvidenceGateService} for the rule and application.yml for how the defaults were chosen.
 */
@ConfigurationProperties(prefix = "aura.retrieval")
public record RetrievalProperties(int candidateLimit, int resultLimit, int rrfK, Evidence evidence) {

    /**
     * @param strongVectorSimilarity cosine similarity at or above which the top chunk is
     *        considered a confident semantic match
     * @param weakVectorSimilarity cosine similarity below which there is no usable semantic signal
     *        at all
     * @param strongQueryTermCoverage query-term coverage that can substitute for corroboration
     *        when similarity is strong, and that can carry a lexically-exact match on its own
     * @param weakQueryTermCoverage minimum coverage for the lexical side to count as any signal
     */
    public record Evidence(double strongVectorSimilarity,
                            double weakVectorSimilarity,
                            double strongQueryTermCoverage,
                            double weakQueryTermCoverage) {
    }
}
