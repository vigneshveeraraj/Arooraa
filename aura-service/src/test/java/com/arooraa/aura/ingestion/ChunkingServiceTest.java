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
    void theRealMesaGuidanceSectionNeverBecomesAChunk() {
        // Verbatim from knowledge-seed/10-mesa.md, which is a PUBLIC document with one section
        // that is guidance for Aura rather than an answer for a visitor. That section produced the
        // citation "What Aura must not disclose about MESA" in the first real owner conversation.
        String mesa = """
                # MESA

                MESA is AROORAA's flagship product — a connected restaurant technology ecosystem.

                ## What MESA does today

                Digital Dining, Kitchen Coordination, Staff Operations, Billing & Commerce.

                ## What Aura must not disclose about MESA
                <!-- retrievable: false — guidance for Aura, not an answer for a visitor -->

                Internal implementation detail is out of scope for any answer — database
                technology, service architecture, event/API design. See
                `91-aura-confidentiality-and-safety.md` for the correct boundary response.
                """;

        List<PreparedChunk> chunks = chunkingService.chunk(mesa);

        assertFalse(chunks.isEmpty(), "the rest of the document is still chunked normally");
        for (PreparedChunk chunk : chunks) {
            assertFalse("What Aura must not disclose about MESA".equals(chunk.sectionHeading()),
                    "a guidance section must not become a citable chunk");
            assertFalse(chunk.text().contains("Internal implementation detail is out of scope"),
                    "and its body must not become evidence either");
            assertFalse(chunk.text().contains("91-aura-confidentiality-and-safety"),
                    "which is also how an internal policy filename was reaching public evidence");
        }
        assertTrue(chunks.stream().anyMatch(chunk -> chunk.text().contains("Digital Dining")),
                "the visitor-facing sections are untouched");
    }

    @Test
    void aSectionIsExcludedByItsHeadingEvenWhenNobodyAddedTheMarker() {
        List<PreparedChunk> chunks = chunkingService.chunk("""
                ## What we do

                Real public content.

                ## Aura's role in this flow

                Aura only ever hands off an explicitly visitor-approved summary.
                """);

        assertEquals(1, chunks.size());
        assertEquals("What we do", chunks.get(0).sectionHeading());
    }

    @Test
    void editorialReviewCommentsAreStrippedFromChunkText() {
        // A note written for the owner is review metadata, not something to embed and quote back.
        List<PreparedChunk> chunks = chunkingService.chunk("""
                ## Building honestly

                Credibility should come from the work itself.

                <!-- NEEDS_OWNER_APPROVAL: exact founding year, headcount, or office location are
                not stated in current public content and must not be invented if a visitor asks. -->
                """);

        assertEquals(1, chunks.size());
        assertTrue(chunks.get(0).text().contains("Credibility should come from the work itself."));
        assertFalse(chunks.get(0).text().contains("NEEDS_OWNER_APPROVAL"));
        assertFalse(chunks.get(0).text().contains("headcount"));
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
