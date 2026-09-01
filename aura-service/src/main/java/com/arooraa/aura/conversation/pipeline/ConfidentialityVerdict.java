package com.arooraa.aura.conversation.pipeline;

/**
 * Whether a turn crosses AROORAA's own confidentiality boundary, and why.
 *
 * <p>{@code reasonCode} is for logs, diagnostics and tests — never for the visitor, who gets a
 * natural answer rather than an error code.
 */
public record ConfidentialityVerdict(boolean internalBoundary, String reasonCode) {

    public static final String SELF_IMPLEMENTATION_QUESTION = "SELF_IMPLEMENTATION_QUESTION";
    public static final String PROMPT_DISCLOSURE_REQUEST = "PROMPT_DISCLOSURE_REQUEST";
    public static final String CREDENTIAL_REQUEST = "CREDENTIAL_REQUEST";
    public static final String INSTRUCTION_OVERRIDE = "INSTRUCTION_OVERRIDE";

    private static final ConfidentialityVerdict ALLOWED = new ConfidentialityVerdict(false, null);

    public static ConfidentialityVerdict allowed() {
        return ALLOWED;
    }

    public static ConfidentialityVerdict boundary(String reasonCode) {
        return new ConfidentialityVerdict(true, reasonCode);
    }
}
