package com.arooraa.leads.project.service;

import java.util.regex.Pattern;

/**
 * Project enquiries can come from outside India (the form collects a separate "country"
 * field), so this deliberately does not reuse the India-only
 * com.arooraa.leads.service.PhoneNumberNormalizer. It follows the same shape (strip
 * separators, validate, normalize) but accepts a loose E.164-style number: an optional
 * leading '+' followed by 7-15 digits, the first of which is non-zero.
 */
public final class InternationalPhoneNormalizer {

    private static final Pattern STRIPPABLE = Pattern.compile("[\\s\\-().]");
    private static final Pattern E164_LIKE = Pattern.compile("^\\+?[1-9]\\d{6,14}$");

    private InternationalPhoneNormalizer() {
    }

    public static boolean isValid(String raw) {
        return extractDigits(raw) != null;
    }

    public static String normalize(String raw) {
        String digits = extractDigits(raw);
        if (digits == null) {
            throw new IllegalArgumentException("Invalid phone number");
        }
        return "+" + digits;
    }

    private static String extractDigits(String raw) {
        if (raw == null) {
            return null;
        }
        String cleaned = STRIPPABLE.matcher(raw.trim()).replaceAll("");
        if (!E164_LIKE.matcher(cleaned).matches()) {
            return null;
        }
        return cleaned.startsWith("+") ? cleaned.substring(1) : cleaned;
    }
}
