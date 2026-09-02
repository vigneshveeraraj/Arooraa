package com.arooraa.aura.provider;

/** Spoken audio, streamed straight back to the browser and never stored. */
public record SynthesisResult(byte[] audio, String mimeType) {
}
