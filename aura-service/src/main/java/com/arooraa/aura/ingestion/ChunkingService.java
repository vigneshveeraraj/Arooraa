package com.arooraa.aura.ingestion;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Deliberately simple paragraph-based chunking — this milestone proves the ingestion pipeline
 * end to end (chunk → embed → persist), not a production-grade chunking strategy. Splits on
 * blank lines, then greedily packs consecutive paragraphs up to {@code maxChunkChars}; a single
 * paragraph longer than that is hard-split so no chunk ever exceeds the limit.
 */
@Component
public class ChunkingService {

    private static final int MAX_CHUNK_CHARS = 1000;

    public List<String> chunk(String rawContent) {
        List<String> paragraphs = splitIntoParagraphs(rawContent);
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();

        for (String paragraph : paragraphs) {
            if (paragraph.length() > MAX_CHUNK_CHARS) {
                flush(chunks, current);
                chunks.addAll(hardSplit(paragraph));
                continue;
            }
            if (current.length() > 0 && current.length() + paragraph.length() + 2 > MAX_CHUNK_CHARS) {
                flush(chunks, current);
            }
            if (current.length() > 0) {
                current.append("\n\n");
            }
            current.append(paragraph);
        }
        flush(chunks, current);
        return chunks;
    }

    private static List<String> splitIntoParagraphs(String text) {
        List<String> paragraphs = new ArrayList<>();
        for (String candidate : text.split("\\n\\s*\\n")) {
            String trimmed = candidate.trim();
            if (!trimmed.isEmpty()) {
                paragraphs.add(trimmed);
            }
        }
        return paragraphs;
    }

    private static List<String> hardSplit(String paragraph) {
        List<String> parts = new ArrayList<>();
        for (int start = 0; start < paragraph.length(); start += MAX_CHUNK_CHARS) {
            parts.add(paragraph.substring(start, Math.min(start + MAX_CHUNK_CHARS, paragraph.length())));
        }
        return parts;
    }

    private static void flush(List<String> chunks, StringBuilder current) {
        if (current.length() > 0) {
            chunks.add(current.toString());
            current.setLength(0);
        }
    }
}
