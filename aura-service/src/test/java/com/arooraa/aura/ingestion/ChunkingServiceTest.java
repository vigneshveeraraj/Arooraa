package com.arooraa.aura.ingestion;

import com.arooraa.aura.ingestion.config.ChunkingProperties;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChunkingServiceTest {

    private final ChunkingService chunkingService = new ChunkingService(new ChunkingProperties(1000, 150));

    @Test
    void shortContentProducesExactlyOneChunk() {
        List<PreparedChunk> chunks = chunkingService.chunk("A short paragraph.\n\nAnother short paragraph.");

        assertEquals(1, chunks.size());
        assertTrue(chunks.get(0).text().contains("A short paragraph."));
        assertTrue(chunks.get(0).text().contains("Another short paragraph."));
        assertNull(chunks.get(0).sectionHeading());
    }

    @Test
    void noHardSplitChunkExceedsTheConfiguredTarget() {
        String longParagraph = "x".repeat(3500);

        List<PreparedChunk> chunks = chunkingService.chunk(longParagraph);

        assertFalse(chunks.isEmpty());
        for (PreparedChunk chunk : chunks) {
            assertTrue(chunk.text().length() <= 1000, "chunk exceeded target size: " + chunk.text().length());
        }
    }

    @Test
    void blankInputProducesNoChunks() {
        assertTrue(chunkingService.chunk("   \n\n  ").isEmpty());
    }

    @Test
    void chunkingIsDeterministic() {
        String content = "# Title\n\nFirst paragraph.\n\n## Section\n\nSecond paragraph with more detail.";

        List<PreparedChunk> first = chunkingService.chunk(content);
        List<PreparedChunk> second = chunkingService.chunk(content);

        assertEquals(first, second, "identical input must produce byte-identical chunks (including offsets/checksums)");
    }

    @Test
    void headingIsCapturedAsMetadataAndPrependedToChunkText() {
        List<PreparedChunk> chunks = chunkingService.chunk("## The problem it addresses\n\nRestaurants often assemble technology one tool at a time.");

        assertEquals(1, chunks.size());
        assertEquals("The problem it addresses", chunks.get(0).sectionHeading());
        assertTrue(chunks.get(0).text().startsWith("The problem it addresses"));
        assertTrue(chunks.get(0).text().contains("Restaurants often assemble"));
    }

    @Test
    void eachSectionStartsItsOwnChunkEvenWhenSmall() {
        List<PreparedChunk> chunks = chunkingService.chunk("# One\n\nFirst body.\n\n# Two\n\nSecond body.");

        assertEquals(2, chunks.size());
        assertEquals("One", chunks.get(0).sectionHeading());
        assertEquals("Two", chunks.get(1).sectionHeading());
    }

    @Test
    void aSectionTooLargeForOneChunkCarriesOverlapIntoTheNextChunk() {
        ChunkingService smallTarget = new ChunkingService(new ChunkingProperties(120, 40));
        // The overlap window only carries the trailing N chars of the previous chunk, so the
        // marker that should survive into the next chunk is placed at the very end of paragraph 1.
        String paragraph1 = "Alpha paragraph with distinctive marker repeated for length padding padding ALPHAMARK.";
        String paragraph2 = "Beta paragraph with distinctive marker BETAMARK repeated for length padding padding padding.";
        List<PreparedChunk> chunks = smallTarget.chunk("# Section\n\n" + paragraph1 + "\n\n" + paragraph2);

        assertTrue(chunks.size() >= 2, "expected the section to require more than one chunk");
        assertTrue(chunks.get(0).text().contains("ALPHAMARK"));
        assertTrue(chunks.get(1).text().contains("ALPHAMARK"),
                "the second chunk should carry trailing overlap from the first");
        assertTrue(chunks.get(1).text().contains("BETAMARK"));
    }

    @Test
    void checksumIsStableAndMatchesTheChunkText() {
        List<PreparedChunk> chunks = chunkingService.chunk("A single short paragraph.");

        assertEquals(1, chunks.size());
        assertEquals(64, chunks.get(0).checksum().length(), "expected a SHA-256 hex digest");
        assertEquals(com.arooraa.aura.support.Sha256.hex(chunks.get(0).text()), chunks.get(0).checksum());
    }

    @Test
    void differentContentProducesDifferentChecksums() {
        String checksumA = chunkingService.chunk("First distinct paragraph.").get(0).checksum();
        String checksumB = chunkingService.chunk("Second distinct paragraph.").get(0).checksum();

        assertFalse(checksumA.equals(checksumB));
    }
}
