package com.arooraa.leads.project.service;

import com.arooraa.leads.project.web.dto.ProjectEnquiryCreateRequest;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Computes a stable hash of the "logical" request payload, used to detect Idempotency-Key
 * reuse with a genuinely different payload (W3.2B §24). Only the hash is ever stored or
 * compared — never the underlying field values — so this never becomes a place raw PII gets
 * logged or persisted a second time just for comparison purposes.
 */
final class RequestFingerprint {

    private RequestFingerprint() {
    }

    static String of(ProjectEnquiryCreateRequest request) {
        String canonical = String.join("",
                String.valueOf(request.submissionVersion()),
                nullToEmpty(request.name()),
                nullToEmpty(request.businessEmail()).toLowerCase(Locale.ROOT),
                nullToEmpty(request.phone()),
                nullToEmpty(request.country()),
                nullToEmpty(request.countryCode()),
                nullToEmpty(request.role()),
                String.valueOf(request.serviceType()),
                String.valueOf(request.projectType()),
                nullToEmpty(request.description()),
                String.valueOf(request.existingSystem()),
                String.valueOf(request.budgetRange()),
                String.valueOf(request.timeline()),
                String.valueOf(request.solutionModel()),
                String.valueOf(request.engagementModel()),
                nullToEmpty(request.problemStatement()),
                String.valueOf(request.projectStage()),
                request.productTypes() == null ? "" : request.productTypes().stream()
                        .map(Enum::name).sorted().collect(Collectors.joining(",")),
                String.valueOf(request.guidedTimeline()),
                String.valueOf(request.guidedBudgetRange()),
                nullToEmpty(request.existingSystemContext()),
                String.valueOf(request.preferredContactMethod()),
                String.valueOf(request.preferredContactTime()),
                String.valueOf(request.whatsappConsent())
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
