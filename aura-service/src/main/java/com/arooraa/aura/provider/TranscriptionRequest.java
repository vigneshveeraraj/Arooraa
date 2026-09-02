package com.arooraa.aura.provider;

/**
 * One piece of recorded speech, already validated by {@code AudioUploadValidator}.
 *
 * @param audio the raw bytes, held in memory for the length of the call and never written to disk
 * @param mimeType the validated media type (an allowlisted value, never the client's raw header)
 * @param filename a name this service generates from {@code mimeType} — the client's own filename
 *        is discarded at the edge, so nothing a caller supplies can influence a path or an
 *        extension anywhere downstream
 * @param languageHint an ISO-639-1 code to bias recognition, or null to let the provider detect
 *        the language itself. Null is the default and the intended value: forcing a language is
 *        how a Tamil or Tanglish utterance gets mangled into approximate English
 */
public record TranscriptionRequest(byte[] audio, String mimeType, String filename, String languageHint) {
}
