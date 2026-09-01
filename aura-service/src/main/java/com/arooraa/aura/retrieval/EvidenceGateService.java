package com.arooraa.aura.retrieval;

import com.arooraa.aura.retrieval.config.RetrievalProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Classifies a retrieval result's top evidence against the (provisional, configurable)
 * strong/weak thresholds — see {@code 95-aura-unknown-answer-policy.md}: a future chat-generation
 * layer must be able to know "I have no approved evidence for this AROORAA-specific claim."
 */
@Component
public class EvidenceGateService {

    private final RetrievalProperties properties;

    public EvidenceGateService(RetrievalProperties properties) {
        this.properties = properties;
    }

    public EvidenceLevel classify(List<Evidence> evidence) {
        if (evidence.isEmpty()) {
            return EvidenceLevel.NO_EVIDENCE;
        }
        double topScore = evidence.get(0).normalizedScore();
        if (topScore >= properties.evidence().strongThreshold()) {
            return EvidenceLevel.STRONG_EVIDENCE;
        }
        if (topScore >= properties.evidence().weakThreshold()) {
            return EvidenceLevel.WEAK_EVIDENCE;
        }
        return EvidenceLevel.NO_EVIDENCE;
    }
}
