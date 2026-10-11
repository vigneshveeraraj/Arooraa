package com.arooraa.leads.capture.service;

import com.arooraa.leads.capture.web.dto.LeadCaptureCreateRequest;
import com.arooraa.leads.service.PhoneNumberNormalizer;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Stable hash of the logical lead-capture payload, used to detect Idempotency-Key reuse with a
 * genuinely different lead — mirrors the contact/project RequestFingerprint. The phone is
 * normalised first so "98765 43210" and "+919876543210" are the same request. Only the hash is
 * ever stored or compared.
 */
final class RequestFingerprint {

    private RequestFingerprint() {
    }

    static String of(LeadCaptureCreateRequest request) {
        String canonical = String.join("\u001f",
                String.valueOf(request.requirement()),
                PhoneNumberNormalizer.normalize(request.phone()),
                nullToEmpty(request.consentText()),
                nullToEmpty(request.sourceLocale()));
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(canonical.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
