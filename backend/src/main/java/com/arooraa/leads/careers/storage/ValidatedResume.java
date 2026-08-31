package com.arooraa.leads.careers.storage;

/**
 * The result of {@link ResumeValidator#validate}: content that has already passed size,
 * declared-type-allowlist and magic-byte checks, plus a filename that is safe to store and
 * display as metadata (never used to build a filesystem path — see {@link ResumeStorage}).
 */
public record ValidatedResume(byte[] content, String sanitizedOriginalFilename, String contentType, long size, String extension) {
}
