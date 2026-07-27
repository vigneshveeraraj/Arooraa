package com.arooraa.leads.service;

import java.util.regex.Pattern;

public final class PhoneNumberNormalizer {

    private static final Pattern STRIPPABLE = Pattern.compile("[\\s-]");
    private static final Pattern TRUNK = Pattern.compile("^[6-9]\\d{9}$");

    private PhoneNumberNormalizer() {
    }

    public static boolean isValid(String raw) {
        return extractTrunk(raw) != null;
    }

    public static String normalize(String raw) {
        String trunk = extractTrunk(raw);
        if (trunk == null) {
            throw new IllegalArgumentException("Invalid Indian mobile number");
        }
        return "+91" + trunk;
    }

    private static String extractTrunk(String raw) {
        if (raw == null) {
            return null;
        }
        String cleaned = STRIPPABLE.matcher(raw.trim()).replaceAll("");
        String trunk;
        if (cleaned.startsWith("+91")) {
            trunk = cleaned.substring(3);
        } else if (cleaned.startsWith("91") && cleaned.length() == 12) {
            trunk = cleaned.substring(2);
        } else {
            trunk = cleaned;
        }
        return TRUNK.matcher(trunk).matches() ? trunk : null;
    }
}
