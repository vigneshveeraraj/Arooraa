package com.arooraa.leads.capture.exception;

/**
 * A server-side off switch is set (e.g. arooraa.lead-capture.enabled=false, WhatsApp not
 * configured) — answered as 404, exactly as if the endpoint didn't exist, so nothing is
 * accepted and nothing claims to be saved.
 */
public class FeatureDisabledException extends RuntimeException {

    public FeatureDisabledException() {
        super("Not found.");
    }
}
