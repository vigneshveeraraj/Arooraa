package com.arooraa.aura.provider;

/**
 * A chat-completion backend, abstracted away from any single vendor (OpenAI, Anthropic, ...) —
 * business/application code must depend only on this interface, never branch on a provider name
 * (frozen architecture requirement). Provider selection is configuration-driven; see
 * {@code aura.provider.chat.*}.
 */
public interface ChatGenerationProvider {

    /** False when no real provider is configured — callers must check this before calling {@link #generate}. */
    boolean isEnabled();

    /**
     * @throws ProviderDisabledException if {@link #isEnabled()} is false.
     */
    ChatGenerationResult generate(ChatGenerationRequest request);
}
