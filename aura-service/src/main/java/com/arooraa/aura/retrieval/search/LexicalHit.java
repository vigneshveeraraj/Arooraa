package com.arooraa.aura.retrieval.search;

import java.util.UUID;

/** One chunk from PostgreSQL full-text search, with its ts_rank score (higher = more relevant). */
public record LexicalHit(UUID chunkId, double rank) {
}
