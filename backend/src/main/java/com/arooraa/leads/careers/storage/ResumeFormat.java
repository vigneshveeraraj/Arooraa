package com.arooraa.leads.careers.storage;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Optional;

/**
 * The only résumé formats this milestone accepts (W3.3B §7) — chosen because each has a magic
 * byte signature this codebase can check without adding a content-sniffing library dependency.
 * DOCX's signature is the generic ZIP header (PK\x03\x04): this confirms the file is a valid
 * ZIP container, not that its internals are a well-formed Office document — a known, documented
 * limitation of "practical" validation (W3.3B §8) rather than a claim of deep format parsing.
 */
enum ResumeFormat {
    PDF("application/pdf", "pdf", "%PDF-".getBytes(StandardCharsets.US_ASCII)),
    DOC("application/msword", "doc",
            new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1}),
    DOCX("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx",
            new byte[]{0x50, 0x4B, 0x03, 0x04});

    private final String contentType;
    private final String extension;
    private final byte[] magicBytes;

    ResumeFormat(String contentType, String extension, byte[] magicBytes) {
        this.contentType = contentType;
        this.extension = extension;
        this.magicBytes = magicBytes;
    }

    String contentType() {
        return contentType;
    }

    String extension() {
        return extension;
    }

    boolean matchesMagicBytes(byte[] content) {
        if (content.length < magicBytes.length) {
            return false;
        }
        return Arrays.equals(content, 0, magicBytes.length, magicBytes, 0, magicBytes.length);
    }

    static Optional<ResumeFormat> byContentType(String contentType) {
        return Arrays.stream(values()).filter(f -> f.contentType.equalsIgnoreCase(contentType)).findFirst();
    }
}
