package com.arooraa.aura.voice;

import com.arooraa.aura.voice.config.VoiceProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Map;

/**
 * The edge of the voice path: everything a browser uploads passes through here before it reaches a
 * provider, and nothing that fails is ever paid for.
 *
 * <p>Four things are enforced, in the order that makes the cheapest check first: the media type is
 * on a fixed allowlist, the byte count is inside its configured band, the declared duration is
 * inside its own, and the result carries a filename this class generated rather than the one the
 * browser sent.
 *
 * <p>That last point is the whole of "safe filename handling". A client filename is never
 * sanitized here because it is never used — it is dropped, and the name that travels onward is
 * derived from the <em>validated</em> media type. There is consequently no path to traverse, no
 * extension to smuggle, and no encoding trick to get right. Nothing is written to disk at any
 * point either: audio exists as a byte array for the length of one request. See
 * {@code spring.servlet.multipart.file-size-threshold} in application.yml, which is pinned equal
 * to the maximum upload size so the container never spills a part to a temporary file.
 */
@Component
public class AudioUploadValidator {

    /**
     * What a browser's MediaRecorder actually produces, and what the transcription providers can
     * read. Chrome and Firefox emit WebM/Opus; Safari emits MP4/AAC; the rest are here because a
     * visitor on an unusual browser is better served by a working recording than a tidy list.
     * Anything not named here is refused — an allowlist, never a denylist.
     */
    private static final Map<String, String> EXTENSION_BY_MIME = Map.ofEntries(
            Map.entry("audio/webm", "webm"),
            Map.entry("audio/ogg", "ogg"),
            Map.entry("audio/oga", "ogg"),
            Map.entry("audio/mp4", "mp4"),
            Map.entry("audio/m4a", "m4a"),
            Map.entry("audio/x-m4a", "m4a"),
            Map.entry("audio/mpeg", "mp3"),
            Map.entry("audio/mpga", "mp3"),
            Map.entry("audio/mp3", "mp3"),
            Map.entry("audio/wav", "wav"),
            Map.entry("audio/x-wav", "wav"),
            Map.entry("audio/wave", "wav"),
            Map.entry("audio/flac", "flac"));

    private final VoiceProperties properties;

    public AudioUploadValidator(VoiceProperties properties) {
        this.properties = properties;
    }

    /**
     * @param declaredDurationMillis what the browser says it recorded, or null. Advisory: a client
     *        can under-report it, which is precisely why the byte ceiling exists and is checked
     *        first. What this catches is the honest client — an accidental tap, or a recording
     *        that ran far longer than the UI should have allowed
     */
    public ValidatedAudio validate(MultipartFile file, Integer declaredDurationMillis) {
        if (file == null || file.isEmpty()) {
            throw new InvalidAudioException("EMPTY_AUDIO", "I didn't catch any audio there. Try again?");
        }

        String mimeType = normalizeMimeType(file.getContentType());
        String extension = EXTENSION_BY_MIME.get(mimeType);
        if (extension == null) {
            throw new InvalidAudioException("UNSUPPORTED_AUDIO_TYPE",
                    "Your browser recorded that in a format I can't read.");
        }

        VoiceProperties.Audio audio = properties.audio();
        long size = file.getSize();
        if (size < audio.minBytes()) {
            throw new InvalidAudioException("AUDIO_TOO_SHORT", "That was too short for me to hear. Hold and speak?");
        }
        if (size > audio.maxBytes()) {
            throw new InvalidAudioException("AUDIO_TOO_LARGE", "That recording is longer than I can take in one go.");
        }

        if (declaredDurationMillis != null) {
            if (declaredDurationMillis < audio.minDurationMillis()) {
                throw new InvalidAudioException("AUDIO_TOO_SHORT", "That was too short for me to hear. Hold and speak?");
            }
            if (declaredDurationMillis > audio.maxDurationSeconds() * 1000L) {
                throw new InvalidAudioException("AUDIO_TOO_LONG",
                        "That recording is longer than I can take in one go.");
            }
        }

        return new ValidatedAudio(readBytes(file), mimeType, "speech." + extension);
    }

    /**
     * Browsers send {@code audio/webm;codecs=opus}. The parameters are stripped before the
     * allowlist is consulted, so the comparison is against a bare type and cannot be defeated by
     * appending one.
     */
    private String normalizeMimeType(String contentType) {
        if (contentType == null) return "";
        int parameterStart = contentType.indexOf(';');
        String bare = parameterStart >= 0 ? contentType.substring(0, parameterStart) : contentType;
        return bare.trim().toLowerCase(Locale.ROOT);
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (Exception e) {
            // The upload was interrupted mid-stream. Nothing about the cause is safe or useful to
            // a visitor, so it becomes the same "say that again" every other audio problem does.
            throw new InvalidAudioException("AUDIO_UNREADABLE", "I couldn't read that recording. Try again?");
        }
    }
}
