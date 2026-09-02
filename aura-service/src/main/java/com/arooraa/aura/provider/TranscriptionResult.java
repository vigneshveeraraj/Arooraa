package com.arooraa.aura.provider;

/**
 * @param text what the visitor said, in their own words and their own script. Never translated —
 *        Tamil comes back in Tamil, Tanglish comes back as the Latin-script Tamil it was spoken as
 * @param detectedLanguage what the provider believed it heard, when it says so. Advisory only:
 *        Aura's own {@code LanguageDetector} still runs on the transcript, so the language a reply
 *        is written in is decided by the same code for a spoken message as for a typed one
 */
public record TranscriptionResult(String text, String detectedLanguage) {
}
