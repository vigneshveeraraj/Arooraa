package com.arooraa.aura.ingestion;

import com.arooraa.aura.ingestion.config.ChunkingProperties;
import com.arooraa.aura.support.Sha256;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic, heading-aware chunker (A2). Splits {@code rawContent} into sections at markdown
 * headings ({@code #}..{@code ######}), then greedily packs each section's paragraphs up to
 * {@code targetChars}; a chunk that continues a section carries the trailing {@code overlapChars}
 * of the previous chunk's body as context (never across a section boundary — a new section always
 * starts a fresh chunk). Every chunk is prefixed with its section heading (real source text, never
 * fabricated) so it stays self-contained if retrieved alone. Only a single paragraph that alone
 * exceeds {@code targetChars} is hard-split by character count — the one place fixed-size slicing
 * is used, and only as a last resort; a section that fits is never split arbitrarily.
 *
 * <p>Deterministic: identical input always produces identical output (same text, offsets and
 * checksums), which is what makes idempotent re-ingestion possible.
 */
@Component
public class ChunkingService {

    private static final Pattern HEADING = Pattern.compile("^(#{1,6})\\s+(.*)$", Pattern.MULTILINE);

    private final int targetChars;
    private final int overlapChars;

    public ChunkingService(ChunkingProperties properties) {
        this.targetChars = properties.targetChars();
        this.overlapChars = properties.overlapChars();
    }

    public List<PreparedChunk> chunk(String rawContent) {
        List<PreparedChunk> chunks = new ArrayList<>();
        for (Section section : splitIntoSections(rawContent)) {
            chunks.addAll(chunkSection(section));
        }
        return chunks;
    }

    private List<Section> splitIntoSections(String rawContent) {
        List<Section> sections = new ArrayList<>();
        Matcher matcher = HEADING.matcher(rawContent);

        int preambleEnd = matcher.find() ? matcher.start() : rawContent.length();
        String preamble = rawContent.substring(0, preambleEnd);
        if (!preamble.isBlank()) {
            sections.add(new Section(null, preamble, 0));
        }
        if (preambleEnd == rawContent.length()) {
            return sections;
        }

        matcher.reset();
        String currentHeading = null;
        int bodyStart = -1;
        while (matcher.find()) {
            if (bodyStart >= 0) {
                sections.add(new Section(currentHeading, rawContent.substring(bodyStart, matcher.start()), bodyStart));
            }
            currentHeading = matcher.group(2).trim();
            bodyStart = matcher.end();
        }
        sections.add(new Section(currentHeading, rawContent.substring(bodyStart), bodyStart));
        return sections;
    }

    private List<PreparedChunk> chunkSection(Section section) {
        List<Paragraph> paragraphs = splitIntoParagraphs(section.body(), section.bodyStart());
        List<PreparedChunk> chunks = new ArrayList<>();

        StringBuilder body = new StringBuilder();
        String overlapPrefix = "";
        int chunkStart = -1;
        int chunkEnd = -1;

        for (Paragraph paragraph : paragraphs) {
            if (paragraph.text().length() > targetChars) {
                flush(chunks, section.heading(), body, overlapPrefix, chunkStart, chunkEnd);
                body.setLength(0);
                overlapPrefix = "";
                chunks.addAll(hardSplit(section.heading(), paragraph));
                chunkStart = -1;
                continue;
            }

            boolean wouldOverflow = body.length() > 0
                    && overlapPrefix.length() + body.length() + paragraph.text().length() + 2 > targetChars;
            if (wouldOverflow) {
                flush(chunks, section.heading(), body, overlapPrefix, chunkStart, chunkEnd);
                overlapPrefix = trailingOverlap(body.toString());
                body.setLength(0);
                chunkStart = -1;
            }

            if (body.length() > 0) {
                body.append("\n\n");
            }
            body.append(paragraph.text());
            if (chunkStart < 0) {
                chunkStart = paragraph.start();
            }
            chunkEnd = paragraph.end();
        }
        flush(chunks, section.heading(), body, overlapPrefix, chunkStart, chunkEnd);
        return chunks;
    }

    private List<Paragraph> splitIntoParagraphs(String body, int bodyOffset) {
        List<Paragraph> paragraphs = new ArrayList<>();
        int cursor = 0;
        for (String candidate : body.split("\\n\\s*\\n")) {
            String trimmed = candidate.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            int localStart = body.indexOf(trimmed, cursor);
            cursor = localStart + trimmed.length();
            paragraphs.add(new Paragraph(trimmed, bodyOffset + localStart, bodyOffset + cursor));
        }
        return paragraphs;
    }

    /** The trailing text of a finished chunk's body, up to overlapChars, that the next chunk in the same section will carry forward as context. */
    private String trailingOverlap(String finishedBody) {
        if (overlapChars <= 0 || finishedBody.isEmpty()) {
            return "";
        }
        return finishedBody.substring(Math.max(0, finishedBody.length() - overlapChars));
    }

    private void flush(List<PreparedChunk> chunks, String heading, StringBuilder body, String overlapPrefix,
                        int chunkStart, int chunkEnd) {
        if (body.length() == 0) {
            return;
        }
        String text = withHeading(heading, overlapPrefix.isEmpty() ? body.toString() : overlapPrefix + "\n\n" + body);
        chunks.add(new PreparedChunk(text, heading, chunkStart, chunkEnd, Sha256.hex(text)));
    }

    private List<PreparedChunk> hardSplit(String heading, Paragraph paragraph) {
        List<PreparedChunk> parts = new ArrayList<>();
        String text = paragraph.text();
        for (int start = 0; start < text.length(); start += targetChars) {
            int end = Math.min(start + targetChars, text.length());
            String piece = text.substring(start, end);
            String withHeading = withHeading(heading, piece);
            parts.add(new PreparedChunk(withHeading, heading, paragraph.start() + start, paragraph.start() + end,
                    Sha256.hex(withHeading)));
        }
        return parts;
    }

    private String withHeading(String heading, String body) {
        return heading == null || heading.isBlank() ? body : heading + "\n\n" + body;
    }

    private record Section(String heading, String body, int bodyStart) {
    }

    private record Paragraph(String text, int start, int end) {
    }
}
