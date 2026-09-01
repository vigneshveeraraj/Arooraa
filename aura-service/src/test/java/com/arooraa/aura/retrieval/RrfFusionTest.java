package com.arooraa.aura.retrieval;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RrfFusionTest {

    @Test
    void aChunkRankedFirstInBothListsScoresHigherThanOneRankedFirstInOnlyOne() {
        UUID inBoth = UUID.randomUUID();
        UUID onlyVector = UUID.randomUUID();
        UUID onlyLexical = UUID.randomUUID();

        Map<UUID, Double> scores = RrfFusion.fuse(
                List.of(inBoth, onlyVector),
                List.of(inBoth, onlyLexical),
                60);

        assertTrue(scores.get(inBoth) > scores.get(onlyVector));
        assertTrue(scores.get(inBoth) > scores.get(onlyLexical));
    }

    @Test
    void scoreMatchesTheReciprocalRankFusionFormula() {
        UUID chunk = UUID.randomUUID();
        int k = 60;

        Map<UUID, Double> scores = RrfFusion.fuse(List.of(chunk), List.of(), k);

        assertEquals(1.0 / (k + 1), scores.get(chunk), 1e-9);
    }

    @Test
    void aChunkAbsentFromBothListsHasNoEntry() {
        UUID chunk = UUID.randomUUID();
        UUID other = UUID.randomUUID();

        Map<UUID, Double> scores = RrfFusion.fuse(List.of(other), List.of(other), 60);

        assertTrue(!scores.containsKey(chunk));
    }

    @Test
    void maxPossibleScoreScalesWithSignalCount() {
        int k = 60;
        assertEquals(1.0 / (k + 1), RrfFusion.maxPossibleScore(1, k), 1e-9);
        assertEquals(2.0 / (k + 1), RrfFusion.maxPossibleScore(2, k), 1e-9);
    }

    @Test
    void fusionIsDeterministic() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();

        Map<UUID, Double> first = RrfFusion.fuse(List.of(a, b), List.of(b, a), 60);
        Map<UUID, Double> second = RrfFusion.fuse(List.of(a, b), List.of(b, a), 60);

        assertEquals(first, second);
    }
}
