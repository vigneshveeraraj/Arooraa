package com.arooraa.aura.retrieval;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Reciprocal Rank Fusion (Cormack, Clarke &amp; Buettcher, 2009) — the frozen A2 choice for
 * combining vector and lexical result lists over any weighted-average scheme, precisely because it
 * needs no tuned weights: a deterministic function of rank alone, so a vector-distance scale and a
 * ts_rank scale never need to be made comparable.
 *
 * <p>score(chunk) = sum over each ranked list containing it of 1 / (k + rank), rank 1-based.
 */
public final class RrfFusion {

    private RrfFusion() {
    }

    public static Map<UUID, Double> fuse(List<UUID> vectorRanked, List<UUID> lexicalRanked, int k) {
        Map<UUID, Double> scores = new LinkedHashMap<>();
        addRanked(scores, vectorRanked, k);
        addRanked(scores, lexicalRanked, k);
        return scores;
    }

    /** The maximum a fused score could reach given how many signals actually contributed a rank-1 hit — what a raw combinedScore is normalized against. */
    public static double maxPossibleScore(int signalCount, int k) {
        return signalCount * (1.0 / (k + 1));
    }

    private static void addRanked(Map<UUID, Double> scores, List<UUID> ranked, int k) {
        for (int i = 0; i < ranked.size(); i++) {
            int rank = i + 1;
            scores.merge(ranked.get(i), 1.0 / (k + rank), Double::sum);
        }
    }
}
