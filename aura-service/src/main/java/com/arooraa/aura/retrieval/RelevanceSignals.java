package com.arooraa.aura.retrieval;

/**
 * The absolute relevance signals the evidence gate judges — deliberately NOT including any RRF
 * score or rank.
 *
 * <p>A2's defect: RRF is a function of rank alone, so the best available result is rank 1 even
 * when it is objectively poor, and a normalized RRF score of 1.0 meant only "nothing beat it" —
 * not "this is relevant". On a small corpus every query therefore looked like STRONG evidence.
 * A2.1 freezes the rule: <b>RRF determines ordering; it must never determine confidence.</b>
 *
 * @param topVectorSimilarity cosine similarity of the best-matching chunk, absolute and
 *        comparable across queries ({@code 1 - cosine distance}); {@code null} when vector search
 *        did not run (no embedding provider configured)
 * @param topLexicalScore raw {@code ts_rank} of the best lexical match; {@code null} when nothing
 *        matched lexically
 * @param queryTermCoverage fraction of the query's meaningful terms that actually appear in the
 *        top evidence text, 0..1 — the explainable absolute lexical signal ("the passage contains
 *        3 of the 4 meaningful words in the question")
 * @param signalsAgree true when vector and lexical search independently returned the same top
 *        chunk. Reported for diagnostics and for A3's future scope classifier, but A2.2 removed it
 *        from the evidence decision itself: on a small corpus a single irrelevant candidate is
 *        trivially agreed on by both searches simply for being the only thing there, so agreement
 *        cannot distinguish a real match from the only available one
 */
public record RelevanceSignals(
        Double topVectorSimilarity,
        Double topLexicalScore,
        double queryTermCoverage,
        boolean signalsAgree) {

    public static RelevanceSignals none() {
        return new RelevanceSignals(null, null, 0.0, false);
    }
}
