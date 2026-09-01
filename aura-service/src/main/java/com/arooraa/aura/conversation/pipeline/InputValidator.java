package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.config.AuraSafetyProperties;
import org.springframework.stereotype.Component;

/**
 * Pipeline stage 1. The first thing every turn passes through, before any classification,
 * retrieval or provider call — so a malformed or oversized message costs nothing but a rejection,
 * and can never reach a paid API or the database.
 *
 * <p>Enforces {@code aura.safety.max-input-chars}, the limit A0/A1 deliberately represented in
 * configuration ahead of having any endpoint to enforce it in. Control characters are stripped
 * rather than rejected: they are almost always an artefact of a paste, not an attack, and quietly
 * cleaning them is friendlier than refusing the message.
 */
@Component
public class InputValidator {

    private final AuraSafetyProperties safetyProperties;

    public InputValidator(AuraSafetyProperties safetyProperties) {
        this.safetyProperties = safetyProperties;
    }

    /**
     * @return the cleaned message, ready for the rest of the pipeline
     * @throws InvalidInputException if it is empty or over the configured size limit
     */
    public String validate(String rawMessage) {
        if (rawMessage == null || rawMessage.isBlank()) {
            throw new InvalidInputException("EMPTY_MESSAGE", "A message is required.");
        }
        String cleaned = rawMessage.replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "").trim();
        if (cleaned.isEmpty()) {
            throw new InvalidInputException("EMPTY_MESSAGE", "A message is required.");
        }
        if (cleaned.length() > safetyProperties.maxInputChars()) {
            throw new InvalidInputException("MESSAGE_TOO_LONG",
                    "That message is longer than I can take in one go (limit "
                            + safetyProperties.maxInputChars() + " characters).");
        }
        return cleaned;
    }
}
