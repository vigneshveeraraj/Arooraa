package com.arooraa.aura.retrieval.search;

import java.util.UUID;

/** One chunk from vector similarity search. {@code distance} is pgvector cosine distance (0 = identical); similarity = 1 - distance. */
public record VectorHit(UUID chunkId, double distance) {
}
