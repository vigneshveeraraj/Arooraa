package com.arooraa.aura.conversation.pipeline;

/**
 * The answer as it may actually be sent, plus what (if anything) had to be done to it.
 *
 * @param text what the visitor will see
 * @param violationCode null when the answer passed untouched; otherwise the check that fired —
 *        recorded for diagnostics and metrics, never shown to the visitor
 * @param replaced true when the generated answer was discarded entirely (a security stop) rather
 *        than repaired in place (a quality fix)
 */
public record GuardrailResult(String text, String violationCode, boolean replaced) {

    public static final String SECRET_MATERIAL = "SECRET_MATERIAL";
    public static final String PROMPT_LEAKAGE = "PROMPT_LEAKAGE";
    public static final String UNSUPPORTED_CLAIM = "UNSUPPORTED_AROORAA_CLAIM";
    public static final String ROBOTIC_PHRASING = "ROBOTIC_PHRASING";
    public static final String EXCESSIVE_LENGTH = "EXCESSIVE_LENGTH";
    /** The answer sent the visitor to an outside company they had not asked about (A1.5). */
    public static final String UNSOLICITED_EXTERNAL_REFERRAL = "UNSOLICITED_EXTERNAL_REFERRAL";

    public static GuardrailResult clean(String text) {
        return new GuardrailResult(text, null, false);
    }

    public static GuardrailResult repaired(String text, String violationCode) {
        return new GuardrailResult(text, violationCode, false);
    }

    public static GuardrailResult blocked(String safeText, String violationCode) {
        return new GuardrailResult(safeText, violationCode, true);
    }

    public boolean passed() {
        return violationCode == null;
    }
}
