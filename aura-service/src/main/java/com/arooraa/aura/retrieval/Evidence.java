package com.arooraa.aura.retrieval;

import java.util.UUID;

/**
 * One piece of retrieved evidence for a query — everything a future chat-generation layer would
 * need to both ground an answer and cite its source. {@code vectorRank}/{@code vectorSimilarity}
 * and {@code lexicalRank}/{@code lexicalScore} are null when that signal didn't return this chunk
 * (e.g. vector search skipped because no embedding provider is enabled). {@code normalizedScore}
 * is {@code combinedScore} scaled to the 0..1 range against the maximum possible RRF score for the
 * number of signals actually searched — what {@link EvidenceLevel} thresholds are compared against.
 */
public record Evidence(
        UUID documentId,
        String documentSlug,
        String documentTitle,
        UUID documentVersionId,
        int versionNumber,
        UUID chunkId,
        int chunkIndex,
        String sectionHeading,
        String sourceUrl,
        String text,
        Integer vectorRank,
        Double vectorSimilarity,
        Integer lexicalRank,
        Double lexicalScore,
        int combinedRank,
        double combinedScore,
        double normalizedScore) {
}
