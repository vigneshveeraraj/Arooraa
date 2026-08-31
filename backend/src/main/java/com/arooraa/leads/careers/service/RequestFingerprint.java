package com.arooraa.leads.careers.service;

import com.arooraa.leads.careers.web.dto.JobApplicationCreateRequest;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;

/**
 * Stable hash of the "logical" application payload, used to detect Idempotency-Key reuse with a
 * genuinely different submission (W3.3B §9). Mirrors project-enquiry's RequestFingerprint
 * exactly in spirit: only the hash is ever stored or compared, never the underlying field
 * values, so this never becomes a second place raw PII gets persisted.
 *
 * <p>Per §9, the résumé's raw bytes are deliberately NOT hashed — that would mean reading and
 * hashing a multipart file on every idempotency check, including replay hits that never touch
 * storage. A résumé's (original filename, declared content type, byte size) triple is a
 * sufficient, safe, deterministic stand-in: two submissions of "the same résumé" produce the
 * same triple, and a candidate who genuinely swaps their résumé between attempts — a different
 * file, almost certainly a different size — produces a different fingerprint, which is exactly
 * the "changed content" case this exists to catch.
 */
final class RequestFingerprint {

    private RequestFingerprint() {
    }

    static String of(JobApplicationCreateRequest request) {
        String canonical = String.join("",
                nullToEmpty(request.jobSlug()),
                nullToEmpty(request.fullName()),
                nullToEmpty(request.email()).toLowerCase(Locale.ROOT),
                nullToEmpty(request.phone()),
                nullToEmpty(request.currentLocation()),
                nullToEmpty(request.experience()),
                nullToEmpty(request.linkedinUrl()),
                nullToEmpty(request.portfolioUrl()),
                nullToEmpty(request.note()),
                String.valueOf(request.recruitmentConsent()),
                nullToEmpty(request.resumeOriginalFilename()),
                nullToEmpty(request.resumeContentType()),
                String.valueOf(request.resumeSize())
        );
        return sha256Hex(canonical);
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
