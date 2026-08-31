package com.arooraa.leads.contact.service;

import com.arooraa.leads.contact.web.dto.ContactMessageCreateRequest;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;

/**
 * Stable hash of the logical Contact payload, used to detect Idempotency-Key reuse with a
 * genuinely different message (W3.4 §12) — mirrors project-enquiry's/recruitment's
 * RequestFingerprint exactly. Only the hash is ever stored or compared, never the field values.
 */
final class RequestFingerprint {

    private RequestFingerprint() {
    }

    static String of(ContactMessageCreateRequest request) {
        String canonical = String.join("",
                nullToEmpty(request.name()),
                nullToEmpty(request.email()).toLowerCase(Locale.ROOT),
                nullToEmpty(request.phone()),
                nullToEmpty(request.company()),
                String.valueOf(request.reason()),
                String.valueOf(request.product()),
                nullToEmpty(request.message())
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
