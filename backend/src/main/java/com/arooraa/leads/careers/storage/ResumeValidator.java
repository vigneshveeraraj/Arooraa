package com.arooraa.leads.careers.storage;

import com.arooraa.leads.careers.exception.InvalidResumeException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

/**
 * Defensive upload handling for résumés (W3.3B §8) — every check here runs before a single byte
 * ever reaches disk. Nothing here trusts the client: not the declared filename, not the declared
 * Content-Type alone (magic bytes must also match), not the size the client claims (the actual
 * byte count is what's measured and enforced).
 */
@Component
public class ResumeValidator {

    private final long maxSizeBytes;

    public ResumeValidator(@Value("${arooraa.recruitment.resume.max-size-bytes:5242880}") long maxSizeBytes) {
        this.maxSizeBytes = maxSizeBytes;
    }

    public ValidatedResume validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidResumeException("Resume file is empty.");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new InvalidResumeException("Resume must be smaller than " + (maxSizeBytes / (1024 * 1024)) + " MB.");
        }

        String declaredType = file.getContentType();
        Optional<ResumeFormat> format = declaredType == null ? Optional.empty() : ResumeFormat.byContentType(declaredType);
        if (format.isEmpty()) {
            throw new InvalidResumeException("Resume must be a PDF, DOC or DOCX file.");
        }

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException e) {
            throw new InvalidResumeException("Unable to read the uploaded resume.");
        }
        if (content.length > maxSizeBytes) {
            throw new InvalidResumeException("Resume must be smaller than " + (maxSizeBytes / (1024 * 1024)) + " MB.");
        }
        if (!format.get().matchesMagicBytes(content)) {
            throw new InvalidResumeException("Resume file content doesn't match its declared type.");
        }

        return new ValidatedResume(content, sanitizeFilename(file.getOriginalFilename()), format.get().contentType(),
                content.length, format.get().extension());
    }

    /**
     * Kept only as display metadata, never used to build a filesystem path (W3.3B §7's
     * "path traversal impossible" — the stored file's actual path is built from a
     * server-generated key, never from this string; see FilesystemResumeStorage).
     */
    private static String sanitizeFilename(String original) {
        String base = original == null ? "resume" : original.replace("\\", "/");
        int slash = base.lastIndexOf('/');
        if (slash >= 0) {
            base = base.substring(slash + 1);
        }
        base = base.replaceAll("[^A-Za-z0-9 ._-]", "_").trim();
        if (base.isEmpty()) {
            base = "resume";
        }
        return base.length() > 150 ? base.substring(0, 150) : base;
    }
}
