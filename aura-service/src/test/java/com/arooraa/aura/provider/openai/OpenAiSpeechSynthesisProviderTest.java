package com.arooraa.aura.provider.openai;

import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import com.arooraa.aura.provider.SynthesisRequest;
import com.arooraa.aura.provider.SynthesisResult;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;


import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.ExpectedCount.times;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withTooManyRequests;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withUnauthorizedRequest;

/** The real synthesis adapter, on the same terms as the other three: mocked HTTP, no key, no bill. */
class OpenAiSpeechSynthesisProviderTest {

    private static final String SECRET_KEY = "sk-test-must-never-appear-in-logs-4711";
    private static final String SPEECH = "https://api.openai.com/v1/audio/speech";
    private static final byte[] AUDIO = {0x49, 0x44, 0x33, 0x04};

    private OpenAiSpeechSynthesisProvider provider;
    private MockRestServiceServer mockServer;
    private ListAppender<ILoggingEvent> logAppender;
    private Logger providerLogger;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        provider = new OpenAiSpeechSynthesisProvider(builder, SECRET_KEY, "gpt-4o-mini-tts");

        providerLogger = (Logger) LoggerFactory.getLogger(OpenAiSpeechSynthesisProvider.class);
        logAppender = new ListAppender<>();
        logAppender.start();
        providerLogger.addAppender(logAppender);
    }

    @AfterEach
    void tearDown() {
        providerLogger.detachAppender(logAppender);
    }

    private SynthesisRequest request() {
        return new SynthesisRequest("MESA is a connected restaurant platform.", "alloy", "mp3", "en");
    }

    @Test
    void returnsTheAudioAndTheContentTypeABrowserCanPlay() {
        mockServer.expect(requestTo(SPEECH))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(AUDIO, MediaType.APPLICATION_OCTET_STREAM));

        SynthesisResult result = provider.synthesize(request());
        assertArrayEquals(AUDIO, result.audio());
        assertEquals("audio/mpeg", result.mimeType());
        mockServer.verify();
    }

    @Test
    void sendsTheConfiguredModelVoiceAndFormatRatherThanAnythingHardcoded() {
        mockServer.expect(requestTo(SPEECH))
                .andExpect(jsonPath("$.model").value("gpt-4o-mini-tts"))
                .andExpect(jsonPath("$.voice").value("alloy"))
                .andExpect(jsonPath("$.response_format").value("mp3"))
                .andExpect(jsonPath("$.input").value("MESA is a connected restaurant platform."))
                .andRespond(withSuccess(AUDIO, MediaType.APPLICATION_OCTET_STREAM));

        provider.synthesize(request());
        mockServer.verify();
    }

    @Test
    void fallsBackToMp3WhenAskedForAFormatItCannotReturn() {
        // Configuration is external, so it can be wrong. A container the browser cannot play is a
        // worse outcome than quietly using the one it can.
        mockServer.expect(requestTo(SPEECH))
                .andExpect(jsonPath("$.response_format").value("mp3"))
                .andRespond(withSuccess(AUDIO, MediaType.APPLICATION_OCTET_STREAM));

        SynthesisResult result = provider.synthesize(
                new SynthesisRequest("Hello.", "alloy", "eight-track", null));
        assertEquals("audio/mpeg", result.mimeType());
    }

    @Test
    void reportsTheRightContentTypeForEachSupportedContainer() {
        mockServer.expect(requestTo(SPEECH)).andRespond(withSuccess(AUDIO, MediaType.APPLICATION_OCTET_STREAM));
        assertEquals("audio/wav",
                provider.synthesize(new SynthesisRequest("Hello.", "alloy", "wav", null)).mimeType());
    }

    @Test
    void anAuthFailureIsPermanentAndIsNeverRetried() {
        mockServer.expect(times(1), requestTo(SPEECH)).andRespond(withUnauthorizedRequest());
        assertThrows(ProviderPermanentException.class, () -> provider.synthesize(request()));
        mockServer.verify();
    }

    @Test
    void aRateLimitIsTransientAndIsRetriedExactlyOnce() {
        mockServer.expect(times(2), requestTo(SPEECH)).andRespond(withTooManyRequests());
        assertThrows(ProviderTransientException.class, () -> provider.synthesize(request()));
        mockServer.verify();
    }

    @Test
    void aServerErrorIsTransientAndIsRetriedExactlyOnce() {
        mockServer.expect(times(2), requestTo(SPEECH)).andRespond(withServerError());
        assertThrows(ProviderTransientException.class, () -> provider.synthesize(request()));
        mockServer.verify();
    }

    @Test
    void anEmptyBodyIsAFailureRatherThanSilence() {
        mockServer.expect(times(1), requestTo(SPEECH))
                .andRespond(withSuccess(new byte[0], MediaType.APPLICATION_OCTET_STREAM));
        assertThrows(ProviderPermanentException.class, () -> provider.synthesize(request()));
    }

    @Test
    void neverLogsTheKeyOrTheTextItWasAskedToSpeak() {
        mockServer.expect(requestTo(SPEECH)).andRespond(withUnauthorizedRequest());
        assertThrows(ProviderPermanentException.class, () -> provider.synthesize(request()));

        for (ILoggingEvent event : logAppender.list) {
            String line = event.getFormattedMessage();
            assertFalse(line.contains(SECRET_KEY), "the API key must never be logged");
            assertFalse(line.contains("sk-"), "no key-shaped value may be logged");
            assertFalse(line.contains("MESA is a connected"), "spoken text must not be logged");
        }
    }
}
