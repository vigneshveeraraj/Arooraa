package com.arooraa.aura.provider;

import java.util.List;

/**
 * A relevance-reranking backend, abstracted away from any single vendor. Optional in the
 * retrieval pipeline — a deployment may run retrieval on raw vector-similarity order alone with
 * this disabled. Provider selection is configuration-driven; see {@code aura.provider.reranking.*}.
 */
public interface RerankingProvider {

    /** False when no real provider is configured. */
    boolean isEnabled();

    /**
     * Returns {@code candidates.size()} results, each naming its original index, ordered most
     * relevant first.
     *
     * @throws ProviderDisabledException if {@link #isEnabled()} is false.
     */
    List<RerankedResult> rerank(String query, List<String> candidates);
}
