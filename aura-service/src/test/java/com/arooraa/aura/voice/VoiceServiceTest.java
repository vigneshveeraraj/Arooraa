package com.arooraa.aura.voice;

import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import com.arooraa.aura.provider.stub.StubSpeechSynthesisProvider;
import com.arooraa.aura.provider.stub.StubSpeechTranscriptionProvider;
import com.arooraa.aura.vocabulary.PublicEntityResolver;
import com.arooraa.aura.voice.config.VoiceProperties;
import com.arooraa.aura.insight.AuraInsightRecorder;
import com.arooraa.aura.insight.config.InsightProperties;
import com.arooraa.aura.protection.TestBudgets;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** The channel itself: what it forwards, what it refuses, and what it never says out loud. */
class VoiceServiceTest {

    private static final VoiceProperties PROPERTIES = new VoiceProperties(
            true,
            new VoiceProperties.Transcription(true, "openai", "whisper-1", 45, ""),
            new VoiceProperties.Synthesis(true, "openai", "tts", "alloy", "mp3", 45, 700),
            new VoiceProperties.Audio(4_194_304L, 60, 400, 1024L));

    private final StubSpeechTranscriptionProvider transcription = new StubSpeechTranscriptionProvider();
    private final StubSpeechSynthesisProvider synthesis = new StubSpeechSynthesisProvider();
    private VoiceService voiceService;

    @BeforeEach
    void setUp() {
        voiceService = new VoiceService(transcription, synthesis,
                new AudioUploadValidator(PROPERTIES), new SpeechTextPreparer(), PROPERTIES,
                new SimpleMeterRegistry(), silentRecorder(), TestBudgets.unlimited(), new PublicEntityResolver());
    }

    /**
     * Analytics is not what these tests are about, and a recorder that swallows its own failures
     * would swallow a null repository too — so it is given one that does nothing rather than a
     * mock nobody asserts on.
     */
    private static AuraInsightRecorder silentRecorder() {
        return new AuraInsightRecorder(null, new InsightProperties(false, false, 50));
    }

    private static MockMultipartFile recording() {
        return new MockMultipartFile("audio", "browser.webm", "audio/webm;codecs=opus", new byte[50_000]);
    }

    @Test
    void returnsWhatTheVisitorSaidWithoutTouchingIt() {
        transcription.hears("What is MESA?");
        assertThat(voiceService.transcribe(recording(), 3_000).text()).isEqualTo("What is MESA?");
    }

    @Test
    void writesOurOwnNamesOurOwnWayBeforeTheVisitorSeesTheTranscript() {
        // The owner's finding: MESA is said clearly and comes back as Meesa, and the question then
        // names nothing Aura can look up. The composer shows the corrected form, which the visitor
        // reads and confirms — nothing is sent on their behalf.
        transcription.hears("Tell me about Meesa");

        VoiceService.Transcript transcript = voiceService.transcribe(recording(), 3_000);

        assertThat(transcript.text()).isEqualTo("Tell me about MESA");
    }

    @Test
    void keepsTheProvidersOwnWordsBesideTheCorrectedOnes() {
        // Whoever is diagnosing a bad recognition needs to know what was actually heard. The raw
        // transcript stays on the record this service returns and is not published on the API.
        transcription.hears("Tell me about Meesa");

        VoiceService.Transcript transcript = voiceService.transcribe(recording(), 3_000);

        assertThat(transcript.rawText()).isEqualTo("Tell me about Meesa");
        assertThat(transcript.text()).isNotEqualTo(transcript.rawText());
    }

    @Test
    void leavesEverythingThatIsNotOneOfOurNamesExactlyAsItWasHeard() {
        transcription.hears("I want a mesa in my dining room");

        VoiceService.Transcript transcript = voiceService.transcribe(recording(), 3_000);

        assertThat(transcript.text()).isEqualTo("I want a mesa in my dining room");
        assertThat(transcript.text()).isEqualTo(transcript.rawText());
    }

    @Test
    void sendsTheProviderOurFilenameAndNotTheBrowsers() {
        transcription.hears("Hello");
        voiceService.transcribe(recording(), 3_000);
        assertThat(transcription.lastRequest().filename()).isEqualTo("speech.webm");
        assertThat(transcription.lastRequest().mimeType()).isEqualTo("audio/webm");
    }

    @Test
    void forcesNoLanguageByDefaultSoTamilAndTanglishSurvive() {
        transcription.hears("MESA-va pathi sollunga");
        voiceService.transcribe(recording(), 3_000);
        assertThat(transcription.lastRequest().languageHint()).isNull();
    }

    @Test
    void passesAConfiguredLanguageThroughWhenAnOperatorInsists() {
        VoiceProperties pinned = new VoiceProperties(true,
                new VoiceProperties.Transcription(true, "openai", "whisper-1", 45, "ta"),
                PROPERTIES.synthesis(), PROPERTIES.audio());
        VoiceService service = new VoiceService(transcription, synthesis,
                new AudioUploadValidator(pinned), new SpeechTextPreparer(), pinned,
                new SimpleMeterRegistry(), silentRecorder(), TestBudgets.unlimited(), new PublicEntityResolver());

        transcription.hears("...");
        service.transcribe(recording(), 3_000);
        assertThat(transcription.lastRequest().languageHint()).isEqualTo("ta");
    }

    @Test
    void refusesToListenWhenTranscriptionIsSwitchedOff() {
        transcription.setEnabled(false);
        assertThatThrownBy(() -> voiceService.transcribe(recording(), 3_000))
                .isInstanceOf(VoiceUnavailableException.class)
                .satisfies(e -> assertThat(((VoiceUnavailableException) e).getCode())
                        .isEqualTo("TRANSCRIPTION_UNAVAILABLE"));
    }

    @Test
    void validatesBeforeSpendingAnythingOnAProvider() {
        // The order matters: a rejected recording must never reach a paid API.
        MockMultipartFile wrongFormat = new MockMultipartFile("audio", "x", "video/mp4", new byte[50_000]);
        assertThatThrownBy(() -> voiceService.transcribe(wrongFormat, 3_000))
                .isInstanceOf(InvalidAudioException.class);
        assertThat(transcription.lastRequest()).isNull();
    }

    @Test
    void turnsEveryProviderFailureIntoSomethingAuraWouldSay() {
        for (RuntimeException failure : new RuntimeException[]{
                new ProviderTransientException("OPENAI_RATE_LIMITED"),
                new ProviderPermanentException("OPENAI_AUTH_FAILED"),
                new ProviderPermanentException("OPENAI_EMPTY_TRANSCRIPT")}) {
            transcription.failNextWith(failure);
            assertThatThrownBy(() -> voiceService.transcribe(recording(), 3_000))
                    .isInstanceOf(VoiceUnavailableException.class)
                    .hasMessageNotContainingAny("OPENAI", "openai", "AUTH", "rate")
                    .satisfies(e -> assertThat(((VoiceUnavailableException) e).getCode())
                            .isEqualTo("TRANSCRIPTION_FAILED"));
        }
    }

    @Test
    void speaksTheAnswerItWasGivenWithNothingAdded() {
        voiceService.speak("MESA is AROORAA's restaurant technology ecosystem.", "en");
        assertThat(synthesis.lastSpokenText()).isEqualTo("MESA is AROORAA's restaurant technology ecosystem.");
    }

    @Test
    void usesTheConfiguredVoiceAndFormatRatherThanAnythingHardcoded() {
        voiceService.speak("Hello.", null);
        assertThat(synthesis.lastRequest().voice()).isEqualTo("alloy");
        assertThat(synthesis.lastRequest().format()).isEqualTo("mp3");
    }

    @Test
    void clampsALongAnswerBeforeSpendingOnSynthesis() {
        String longAnswer = ("A sentence about MESA that is not especially short. ").repeat(40);
        voiceService.speak(longAnswer, "en");

        assertThat(synthesis.lastSpokenText().length()).isLessThanOrEqualTo(700);
        assertThat(longAnswer).startsWith(synthesis.lastSpokenText());
    }

    @Test
    void refusesToSpeakWhenSynthesisIsSwitchedOff() {
        synthesis.setEnabled(false);
        assertThatThrownBy(() -> voiceService.speak("Anything.", "en"))
                .isInstanceOf(VoiceUnavailableException.class)
                .satisfies(e -> assertThat(((VoiceUnavailableException) e).getCode())
                        .isEqualTo("SYNTHESIS_UNAVAILABLE"));
    }

    @Test
    void turnsASynthesisFailureIntoSomethingAuraWouldSay() {
        synthesis.failNextWith(new ProviderTransientException("OPENAI_SERVER_ERROR"));
        assertThatThrownBy(() -> voiceService.speak("Anything.", "en"))
                .isInstanceOf(VoiceUnavailableException.class)
                .hasMessageNotContainingAny("OPENAI", "SERVER_ERROR")
                .satisfies(e -> assertThat(((VoiceUnavailableException) e).getCode()).isEqualTo("SYNTHESIS_FAILED"));
    }

    @Test
    void hasNothingToSayAboutAnEmptyAnswer() {
        assertThatThrownBy(() -> voiceService.speak("   ", "en")).isInstanceOf(InvalidAudioException.class);
        assertThat(synthesis.lastRequest()).isNull();
    }
}
