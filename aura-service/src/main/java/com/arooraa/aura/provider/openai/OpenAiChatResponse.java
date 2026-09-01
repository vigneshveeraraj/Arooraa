package com.arooraa.aura.provider.openai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/** Only the fields Aura uses; everything else the API returns is ignored rather than modelled. */
@JsonIgnoreProperties(ignoreUnknown = true)
record OpenAiChatResponse(String model, List<Choice> choices, Usage usage) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Choice(Message message, @JsonProperty("finish_reason") String finishReason) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Message(String role, String content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Usage(@JsonProperty("prompt_tokens") Integer promptTokens,
                  @JsonProperty("completion_tokens") Integer completionTokens) {
    }
}
