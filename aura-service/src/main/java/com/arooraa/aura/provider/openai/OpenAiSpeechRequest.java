package com.arooraa.aura.provider.openai;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/** The wire body for {@code /audio/speech}. */
@JsonInclude(JsonInclude.Include.NON_NULL)
record OpenAiSpeechRequest(String model, String input, String voice,
                            @JsonProperty("response_format") String responseFormat) {
}
