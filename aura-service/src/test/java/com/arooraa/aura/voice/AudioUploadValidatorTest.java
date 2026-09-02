package com.arooraa.aura.voice;

import com.arooraa.aura.voice.config.VoiceProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The edge of the voice path. Everything here is about what a browser may not get past — and one
 * thing about what it cannot influence at all, which is the filename.
 */
class AudioUploadValidatorTest {

    private static final VoiceProperties PROPERTIES = new VoiceProperties(
            true,
            new VoiceProperties.Transcription(true, "openai", "whisper-1", 45, ""),
            new VoiceProperties.Synthesis(true, "openai", "tts", "alloy", "mp3", 45, 700),
            new VoiceProperties.Audio(4_194_304L, 60, 400, 1024L));

    private final AudioUploadValidator validator = new AudioUploadValidator(PROPERTIES);

    private static MockMultipartFile audio(String contentType, int bytes) {
        return new MockMultipartFile("audio", "whatever.bin", contentType, new byte[bytes]);
    }

    @ParameterizedTest
    @ValueSource(strings = {"audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/flac"})
    void acceptsTheFormatsBrowsersActuallyRecordIn(String mimeType) {
        assertThat(validator.validate(audio(mimeType, 50_000), 3_000).mimeType()).isEqualTo(mimeType);
    }

    @Test
    void stripsCodecParametersBeforeConsultingTheAllowlist() {
        // What Chrome actually sends. An allowlist compared against the raw header would reject
        // every real recording; one compared against a bare type cannot be defeated by appending
        // a parameter either.
        ValidatedAudio validated = validator.validate(audio("audio/webm;codecs=opus", 50_000), 3_000);
        assertThat(validated.mimeType()).isEqualTo("audio/webm");
    }

    @Test
    void isCaseInsensitiveAboutTheMediaType() {
        assertThat(validator.validate(audio("AUDIO/WEBM", 50_000), 3_000).mimeType()).isEqualTo("audio/webm");
    }

    @ParameterizedTest
    @ValueSource(strings = {"application/octet-stream", "video/mp4", "text/plain", "image/png",
            "application/x-sh", "audio/webm-evil", ""})
    void refusesEverythingElse(String mimeType) {
        assertThatThrownBy(() -> validator.validate(audio(mimeType, 50_000), 3_000))
                .isInstanceOf(InvalidAudioException.class)
                .satisfies(e -> assertThat(((InvalidAudioException) e).getCode()).isEqualTo("UNSUPPORTED_AUDIO_TYPE"));
    }

    @Test
    void refusesAMissingMediaTypeRatherThanGuessingOne() {
        MockMultipartFile noType = new MockMultipartFile("audio", "x.webm", null, new byte[50_000]);
        assertThatThrownBy(() -> validator.validate(noType, 3_000))
                .isInstanceOf(InvalidAudioException.class);
    }

    @Test
    void namesTheFileItselfAndIgnoresWhateverTheBrowserCalledIt() {
        // The whole of "safe filename handling": the client's name is not sanitized, it is
        // discarded. What travels onward is derived from the validated media type, so there is no
        // path to traverse and no extension to smuggle.
        MockMultipartFile hostile = new MockMultipartFile(
                "audio", "../../etc/passwd.sh", "audio/webm", new byte[50_000]);
        assertThat(validator.validate(hostile, 3_000).filename()).isEqualTo("speech.webm");
    }

    @Test
    void mapsEachAcceptedTypeToItsOwnExtension() {
        assertThat(validator.validate(audio("audio/mp4", 50_000), 3_000).filename()).isEqualTo("speech.mp4");
        assertThat(validator.validate(audio("audio/mpeg", 50_000), 3_000).filename()).isEqualTo("speech.mp3");
        assertThat(validator.validate(audio("audio/x-m4a", 50_000), 3_000).filename()).isEqualTo("speech.m4a");
    }

    @Test
    void refusesAnEmptyUpload() {
        MockMultipartFile empty = new MockMultipartFile("audio", "x.webm", "audio/webm", new byte[0]);
        assertThatThrownBy(() -> validator.validate(empty, 3_000))
                .isInstanceOf(InvalidAudioException.class)
                .satisfies(e -> assertThat(((InvalidAudioException) e).getCode()).isEqualTo("EMPTY_AUDIO"));
    }

    @Test
    void refusesARecordingTooSmallToContainSpeech() {
        assertThatThrownBy(() -> validator.validate(audio("audio/webm", 200), 3_000))
                .isInstanceOf(InvalidAudioException.class)
                .satisfies(e -> assertThat(((InvalidAudioException) e).getCode()).isEqualTo("AUDIO_TOO_SHORT"));
    }

    @Test
    void refusesARecordingOverTheByteCeiling() {
        assertThatThrownBy(() -> validator.validate(audio("audio/webm", 5_000_000), 3_000))
                .isInstanceOf(InvalidAudioException.class)
                .satisfies(e -> assertThat(((InvalidAudioException) e).getCode()).isEqualTo("AUDIO_TOO_LARGE"));
    }

    @Test
    void refusesAnAccidentalTapOnTheMicrophone() {
        assertThatThrownBy(() -> validator.validate(audio("audio/webm", 50_000), 120))
                .isInstanceOf(InvalidAudioException.class)
                .satisfies(e -> assertThat(((InvalidAudioException) e).getCode()).isEqualTo("AUDIO_TOO_SHORT"));
    }

    @Test
    void refusesADeclaredDurationBeyondTheConfiguredCeiling() {
        assertThatThrownBy(() -> validator.validate(audio("audio/webm", 50_000), 90_000))
                .isInstanceOf(InvalidAudioException.class)
                .satisfies(e -> assertThat(((InvalidAudioException) e).getCode()).isEqualTo("AUDIO_TOO_LONG"));
    }

    @Test
    void acceptsAnUploadThatDeclaresNoDurationAtAll() {
        // A client may simply not know. The byte ceiling is the bound that matters and it still
        // applies — this only means the courtesy check has nothing to check.
        assertThat(validator.validate(audio("audio/webm", 50_000), null).filename()).isEqualTo("speech.webm");
    }

    @Test
    void underReportingTheDurationDoesNotGetPastTheByteCeiling() {
        // The reason the byte limit is the authoritative one: a client controls what it declares,
        // and controls nothing about what the container counted.
        assertThatThrownBy(() -> validator.validate(audio("audio/webm", 5_000_000), 1_000))
                .isInstanceOf(InvalidAudioException.class)
                .satisfies(e -> assertThat(((InvalidAudioException) e).getCode()).isEqualTo("AUDIO_TOO_LARGE"));
    }

    @Test
    void saysNothingAboutFormatsProvidersOrLimitsInWhatAVisitorReads() {
        // Visitor-facing text is Aura's, not a validator's: no MIME list, no byte count, no
        // provider name, no configuration key.
        for (String mimeType : new String[]{"application/octet-stream", ""}) {
            assertThatThrownBy(() -> validator.validate(audio(mimeType, 50_000), 3_000))
                    .hasMessageNotContainingAny("audio/webm", "openai", "whisper", "4194304", "aura.voice");
        }
    }
}
