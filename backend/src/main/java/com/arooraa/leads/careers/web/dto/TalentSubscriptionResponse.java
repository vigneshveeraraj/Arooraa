package com.arooraa.leads.careers.web.dto;

/** Never claims a specific future email frequency (W3.3B §12) — a plain, honest confirmation. */
public record TalentSubscriptionResponse(String status, String message) {
    public static final String STATUS_SUBSCRIBED = "SUBSCRIBED";
    public static final String DEFAULT_MESSAGE =
            "You're on the list. We'll reach out if a relevant opportunity opens.";
}
