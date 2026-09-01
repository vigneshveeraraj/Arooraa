package com.arooraa.aura.provider.disabled;

import com.arooraa.aura.provider.ProviderDisabledException;
import com.arooraa.aura.provider.RerankedResult;
import com.arooraa.aura.provider.RerankingProvider;

import java.util.List;

/** Production-safe default when no reranking provider is configured — the application must still start and stay healthy. */
public class DisabledRerankingProvider implements RerankingProvider {

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public List<RerankedResult> rerank(String query, List<String> candidates) {
        throw new ProviderDisabledException("Reranking provider is not configured.");
    }
}
