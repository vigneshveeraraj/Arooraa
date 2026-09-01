package com.arooraa.aura.retrieval;

import com.arooraa.aura.retrieval.config.RetrievalProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Decides how much the top evidence can be trusted, from <b>absolute</b> relevance signals only.
 *
 * <p>A2 classified on normalized RRF score, which is a function of rank: the best available chunk
 * is rank 1 whether it is excellent or irrelevant, so on a small corpus almost everything scored
 * 1.0 and read as STRONG — including "what database does MESA use internally?", where the honest
 * answer is that no approved evidence exists. A2.1 freezes the separation: <b>RRF orders results;
 * this gate decides confidence, and never sees a rank.</b>
 *
 * <p>The rule, in order:
 * <ol>
 *   <li><b>NO_EVIDENCE</b> — nothing retrieved, or the top chunk is below {@code weakVectorSimilarity}
 *       AND below {@code weakQueryTermCoverage}. Neither signal says this passage is about the
 *       question, so the corpus has nothing to offer.</li>
 *   <li><b>STRONG_EVIDENCE</b> — the top chunk is a confident semantic match
 *       ({@code >= strongVectorSimilarity}) AND is corroborated, either by both searches
 *       independently returning it or by high query-term coverage. Semantic similarity alone is
 *       not enough: embeddings rate a topically-adjacent passage highly even when it does not
 *       address the question, which is exactly the confidentiality failure mode.</li>
 *   <li><b>STRONG_EVIDENCE</b> — or the query is lexically almost fully answered by the passage
 *       ({@code coverage >= strongQueryTermCoverage}) AND there is at least some semantic support
 *       ({@code >= weakVectorSimilarity}). Covers exact-terminology questions where similarity
 *       lands mid-range.</li>
 *   <li><b>WEAK_EVIDENCE</b> — otherwise. Something is related, but not enough for a confident
 *       AROORAA-specific factual claim.</li>
 * </ol>
 *
 * <p>Consumed later by generation (see {@code 95-aura-unknown-answer-policy.md}): NO_EVIDENCE must
 * not produce an AROORAA-specific answer, WEAK must qualify or ask, STRONG may ground a claim.
 */
@Component
public class EvidenceGateService {

    private final RetrievalProperties properties;

    public EvidenceGateService(RetrievalProperties properties) {
        this.properties = properties;
    }

    public EvidenceLevel classify(List<Evidence> evidence, RelevanceSignals signals) {
        if (evidence.isEmpty()) {
            return EvidenceLevel.NO_EVIDENCE;
        }

        RetrievalProperties.Evidence thresholds = properties.evidence();
        double similarity = signals.vectorSimilarityOrZero();
        double coverage = signals.queryTermCoverage();

        boolean anySemanticSignal = similarity >= thresholds.weakVectorSimilarity();
        boolean anyLexicalSignal = coverage >= thresholds.weakQueryTermCoverage();
        if (!anySemanticSignal && !anyLexicalSignal) {
            return EvidenceLevel.NO_EVIDENCE;
        }

        boolean confidentSemanticMatch = similarity >= thresholds.strongVectorSimilarity();
        boolean corroborated = signals.signalsAgree() || coverage >= thresholds.strongQueryTermCoverage();
        if (confidentSemanticMatch && corroborated) {
            return EvidenceLevel.STRONG_EVIDENCE;
        }
        if (coverage >= thresholds.strongQueryTermCoverage() && anySemanticSignal) {
            return EvidenceLevel.STRONG_EVIDENCE;
        }

        return EvidenceLevel.WEAK_EVIDENCE;
    }
}
