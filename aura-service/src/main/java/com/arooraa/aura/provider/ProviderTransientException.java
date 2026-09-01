package com.arooraa.aura.provider;

/**
 * A provider call failed in a way that might succeed on retry — timeout, connection failure, or
 * a 5xx response. Provider-neutral (never vendor-specific) so callers like {@code IngestionService}
 * can classify failures without knowing which vendor is behind the interface. Never carries the
 * raw response body (security baseline: no provider-internal detail leakage).
 */
public class ProviderTransientException extends RuntimeException {

    public ProviderTransientException(String message) {
        super(message);
    }

    public ProviderTransientException(String message, Throwable cause) {
        super(message, cause);
    }
}
