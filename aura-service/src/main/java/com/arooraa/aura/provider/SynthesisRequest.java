package com.arooraa.aura.provider;

/**
 * @param text the answer to speak — already the visitor-visible text, never a fresh generation
 * @param voice the configured voice name, passed through verbatim to the adapter
 * @param format the desired container ("mp3"), from configuration
 * @param languageHint ISO-639-1 for the language the text is in, or null. Advisory: adapters that
 *        cannot use it ignore it rather than translating anything
 */
public record SynthesisRequest(String text, String voice, String format, String languageHint) {
}
