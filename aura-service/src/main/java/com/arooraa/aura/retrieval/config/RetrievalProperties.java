package com.arooraa.aura.retrieval.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Backed by {@code aura.retrieval.*}. {@code evidence} thresholds are explicitly provisional —
 * see application.yml's comment on them; not derived from any measurement yet.
 */
@ConfigurationProperties(prefix = "aura.retrieval")
public record RetrievalProperties(int candidateLimit, int resultLimit, int rrfK, Evidence evidence) {

    public record Evidence(double strongThreshold, double weakThreshold) {
    }
}
