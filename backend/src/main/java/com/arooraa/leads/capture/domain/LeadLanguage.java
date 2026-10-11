package com.arooraa.leads.capture.domain;

import java.util.Locale;

/** Stored as its lowercase code ("en"/"ta"), matching the frontend's LeadLocale values. */
public enum LeadLanguage {
    EN,
    TA;

    public String code() {
        return name().toLowerCase(Locale.ROOT);
    }

    public static LeadLanguage fromCode(String code) {
        if (code == null) {
            return null;
        }
        return switch (code.trim().toLowerCase(Locale.ROOT)) {
            case "en" -> EN;
            case "ta" -> TA;
            default -> throw new IllegalArgumentException("Unsupported language code");
        };
    }
}
