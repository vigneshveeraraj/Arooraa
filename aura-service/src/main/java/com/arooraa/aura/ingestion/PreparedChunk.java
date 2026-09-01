package com.arooraa.aura.ingestion;

/**
 * One chunk produced by {@link ChunkingService}, before it becomes a persisted {@code AuraChunk}.
 * {@code checksum} is a stable SHA-256 fingerprint of {@code text} — proves chunking is
 * deterministic (same {@code rawContent} in, byte-identical chunks and checksums out).
 */
public record PreparedChunk(String text, String sectionHeading, int charStart, int charEnd, String checksum) {
}
