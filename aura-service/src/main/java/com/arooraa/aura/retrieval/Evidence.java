package com.arooraa.aura.retrieval;

import java.util.UUID;

/**
 * One piece of retrieved evidence for a query — everything a future chat-generation layer needs to
 * both ground an answer and cite its source. {@code vectorRank}/{@code vectorSimilarity} and
 * {@code lexicalRank}/{@code lexicalScore} are null when that signal didn't return this chunk
 * (e.g. vector search skipped because no embedding provider is enabled).
 *
 * <p>{@code combinedRank}/{@code combinedScore} are the RRF fusion outputs — they order results
 * and nothing more. Confidence comes from {@link RelevanceSignals} on the result, never from these
 * (A2.1; see {@link EvidenceGateService}). {@code normalizedScore} is retained as a diagnostic for
 * comparing fusion behaviour across queries, explicitly not as a confidence measure.
 */
public record Evidence(
        UUID documentId,
        String documentSlug,
        String documentTitle,
        UUID documentVersionId,
        int versionNumber,
        String knowledgeSpace,
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
