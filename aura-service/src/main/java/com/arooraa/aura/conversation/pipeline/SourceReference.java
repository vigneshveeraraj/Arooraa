package com.arooraa.aura.conversation.pipeline;

/**
 * A citation as a visitor may see it. Three visitor-meaningful fields and nothing else — no ids, no
 * scores, no knowledge space, no chunk text. Whatever else the retrieval layer knows about a piece
 * of evidence stops here.
 */
public record SourceReference(String title, String section, String sourceUrl) {
}
