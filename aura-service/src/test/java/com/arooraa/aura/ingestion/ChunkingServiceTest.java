package com.arooraa.aura.ingestion;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChunkingServiceTest {

    private final ChunkingService chunkingService = new ChunkingService();

    @Test
    void shortContentProducesExactlyOneChunk() {
        List<String> chunks = chunkingService.chunk("A short paragraph.\n\nAnother short paragraph.");

        assertEquals(1, chunks.size());
        assertTrue(chunks.get(0).contains("A short paragraph."));
        assertTrue(chunks.get(0).contains("Another short paragraph."));
    }

    @Test
    void noChunkExceedsTheConfiguredMaximum() {
        String longParagraph = "x".repeat(3500);

        List<String> chunks = chunkingService.chunk(longParagraph);

        assertFalse(chunks.isEmpty());
        for (String chunk : chunks) {
            assertTrue(chunk.length() <= 1000, "chunk exceeded max size: " + chunk.length());
        }
    }

    @Test
    void blankInputProducesNoChunks() {
        assertTrue(chunkingService.chunk("   \n\n  ").isEmpty());
    }
}
