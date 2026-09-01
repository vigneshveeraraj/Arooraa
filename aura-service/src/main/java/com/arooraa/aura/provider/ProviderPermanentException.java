package com.arooraa.aura.provider;

/**
 * A provider call failed in a way that will never succeed on retry — authentication failure,
 * an invalid request, or a returned embedding whose dimension doesn't match what's configured.
 * Provider-neutral; never carries the raw response body. Callers must not retry this.
 */
public class ProviderPermanentException extends RuntimeException {

    public ProviderPermanentException(String message) {
        super(message);
    }

    public ProviderPermanentException(String message, Throwable cause) {
        super(message, cause);
    }
}
