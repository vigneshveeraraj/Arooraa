package com.arooraa.aura.retrieval;

import com.arooraa.aura.retrieval.config.RetrievalProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Decides how much the top evidence can be trusted, from <b>absolute</b> relevance signals only.
 *
 * <p>A2 classified on normalized RRF score, which is a function of rank: the best available chunk
 * is rank 1 whether it is excellent or irrelevant, so on a small corpus almost everything scored
 * 1.0 and read as STRONG. A2.1 froze the separation: <b>RRF orders results; this gate decides
 * confidence, and never sees a rank.</b> A2.1's gate treated semantic similarity and lexical
 * coverage as two independent "any signal" votes, which let generic lexical overlap (shared
 * stopword-adjacent terms such as "what/is/today") promote a semantically irrelevant result all
 * the way to WEAK_EVIDENCE — measured directly against the real OpenAI provider: "What is today's
 * weather?" (similarity 0.275, well below the calibrated weak floor, coverage 0.5 purely
 * coincidental) read as WEAK. A2.2 freezes a second rule on top of the first:
 * <b>semantic similarity is the primary relevance signal; lexical coverage can only strengthen a
 * result semantic similarity already supports, never rescue one it doesn't.</b>
 *
 * <p>The rule, in order, once vector search actually ran (similarity is non-null):
 * <ol>
 *   <li><b>NO_EVIDENCE</b> — similarity is below {@code weakVectorSimilarity}. The passage is not
 *       about the question; no amount of incidental lexical overlap changes that.</li>
 *   <li><b>STRONG_EVIDENCE</b> — similarity is at or above {@code strongVectorSimilarity}. Measured
 *       against the real provider, this range cleanly separates the approved corpus's positive set
 *       (min 0.583) from its negative set (max 0.275) — a confident semantic match stands on its
 *       own, with no lexical corroboration required. This matters most for Tamil/Tanglish queries:
 *       {@link QueryTermCoverage} is inherently English-biased, so requiring lexical agreement
 *       would cap every correctly-matched multilingual query at WEAK regardless of how sure the
 *       embedding is.</li>
 *   <li><b>STRONG_EVIDENCE</b> — otherwise (a medium similarity, between the two floors), only if
 *       the passage is lexically almost fully answered by the passage ({@code coverage >=
 *       strongQueryTermCoverage}) — an exact-terminology match strong enough to carry a result
 *       similarity alone did not confidently support. Plain rank agreement between the two
 *       searches ({@code signalsAgree}) is deliberately <em>not</em> part of this test: in a small
 *       corpus a single irrelevant candidate is trivially "agreed on" by both searches simply for
 *       being the only thing there (see {@code EvidenceBandsIT.borderlineSimilarityProducesWeakEvidence}).</li>
 *   <li><b>WEAK_EVIDENCE</b> — otherwise. Something is related, but not enough for a confident
 *       AROORAA-specific factual claim.</li>
 * </ol>
 *
 * <p>When vector search did not run at all (no embedding provider configured — similarity is
 * null), lexical coverage is the only signal available and decides alone, unchanged from A2.1:
 * {@code >= strongQueryTermCoverage} is STRONG, {@code >= weakQueryTermCoverage} is WEAK, else
 * NO_EVIDENCE.
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
        Double similarity = signals.topVectorSimilarity();
        double coverage = signals.queryTermCoverage();

        if (similarity != null) {
            if (similarity < thresholds.weakVectorSimilarity()) {
                return EvidenceLevel.NO_EVIDENCE;
            }
            if (similarity >= thresholds.strongVectorSimilarity()) {
                return EvidenceLevel.STRONG_EVIDENCE;
            }
            return coverage >= thresholds.strongQueryTermCoverage()
                    ? EvidenceLevel.STRONG_EVIDENCE
                    : EvidenceLevel.WEAK_EVIDENCE;
        }

        if (coverage >= thresholds.strongQueryTermCoverage()) {
            return EvidenceLevel.STRONG_EVIDENCE;
        }
        return coverage >= thresholds.weakQueryTermCoverage()
                ? EvidenceLevel.WEAK_EVIDENCE
                : EvidenceLevel.NO_EVIDENCE;
    }
}
