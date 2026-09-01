package com.arooraa.aura.provider;

/** Thrown when a provider method is called while {@code isEnabled()} is false. Never carries provider-internal details. */
public class ProviderDisabledException extends RuntimeException {

    public ProviderDisabledException(String message) {
        super(message);
    }
}
