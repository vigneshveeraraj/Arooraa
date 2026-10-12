package com.arooraa.leads.capture.whatsapp;

import java.time.Duration;
import java.util.UUID;

/**
 * Sends one free-form text reply. Implementations never throw for transport problems and never put
 * the token, recipient or message text into an outcome — codes only.
 */
public interface WhatsAppGateway {

    SendOutcome sendText(UUID correlationId, String recipientDigits, String body);

    sealed interface SendOutcome {
    }

    /** Meta accepted the message and returned its id. */
    record Accepted(String metaMessageId) implements SendOutcome {
    }

    /** Meta explicitly did NOT accept it (throttled, or the connection never opened) — safe to retry later. */
    record RetryableNotAccepted(String code, Duration retryAfter) implements SendOutcome {
    }

    /** Rejected (auth, permission, invalid recipient, policy) — retrying will not help. */
    record Terminal(String code) implements SendOutcome {
    }

    /** It may or may not have been sent (timeout, reset, 5xx, unreadable 2xx). Never resent automatically. */
    record Unknown(String code) implements SendOutcome {
    }
}
