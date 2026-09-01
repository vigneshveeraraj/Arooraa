package com.arooraa.aura.provider.openai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/** Wire shape for OpenAI chat completions. Confined to this package, like every other OpenAI type. */
record OpenAiChatRequest(
        String model,
        List<Message> messages,
        double temperature,
        @JsonProperty("max_completion_tokens") int maxCompletionTokens) {

    record Message(String role, String content) {
    }
}
