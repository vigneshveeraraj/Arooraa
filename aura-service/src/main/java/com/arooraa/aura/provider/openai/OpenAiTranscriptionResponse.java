package com.arooraa.aura.provider.openai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** The two fields we read from {@code /audio/transcriptions}; everything else is ignored. */
@JsonIgnoreProperties(ignoreUnknown = true)
record OpenAiTranscriptionResponse(String text, String language) {
}
