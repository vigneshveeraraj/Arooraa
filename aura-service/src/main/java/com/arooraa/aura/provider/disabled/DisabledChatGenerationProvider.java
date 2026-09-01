package com.arooraa.aura.provider.disabled;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.ChatGenerationRequest;
import com.arooraa.aura.provider.ChatGenerationResult;
import com.arooraa.aura.provider.ProviderDisabledException;

/** Production-safe default when no chat provider is configured — the application must still start and stay healthy. */
public class DisabledChatGenerationProvider implements ChatGenerationProvider {

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public ChatGenerationResult generate(ChatGenerationRequest request) {
        throw new ProviderDisabledException("Chat generation provider is not configured.");
    }
}
