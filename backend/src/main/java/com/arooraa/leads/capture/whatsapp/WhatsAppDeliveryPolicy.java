package com.arooraa.leads.capture.whatsapp;

import java.time.Duration;
import java.time.Instant;

/** Pure delivery limits. The local Ollama draft was corrected by the supervising engineer. */
public final class WhatsAppDeliveryPolicy {
    private WhatsAppDeliveryPolicy() {}

    public static boolean windowOpen(Instant customerMessageAt, Instant now) {
        return customerMessageAt != null && now != null && !customerMessageAt.isAfter(now)
                && Duration.between(customerMessageAt, now).compareTo(Duration.ofHours(24)) < 0;
    }

    public static Duration retryDelay(int completedAttempts, Duration requested) {
        int exponent = (int) Math.max(0L, Math.min(6L, (long) completedAttempts - 1));
        Duration base = Duration.ofSeconds(5L << exponent);
        Duration delay = requested != null && requested.compareTo(base) > 0 ? requested : base;
        return delay.compareTo(Duration.ofMinutes(5)) > 0 ? Duration.ofMinutes(5) : delay;
    }

    public static boolean terminalAttempt(int completedAttempts) {
        return completedAttempts >= 3;
    }

    public static int deliveryRank(String status) {
        if (status == null) return 0;
        return switch (status) {
            case "sent" -> 1;
            case "delivered" -> 2;
            case "read" -> 3;
            default -> 0;
        };
    }
}
