package com.arooraa.aura.provider.openai;

import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import com.arooraa.aura.provider.TranscriptionRequest;
import com.arooraa.aura.provider.TranscriptionResult;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.http.client.MockClientHttpRequest;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.ExpectedCount.times;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withTooManyRequests;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withUnauthorizedRequest;

/**
 * The real transcription adapter against a mocked HTTP server — no network, no key, so it runs in
 * every normal build.
 *
 * <p>The first test is the one that matters most and would have been easy to leave out: the
 * endpoint. OpenAI has two, and the wrong one silently translates every Tamil sentence into
 * English — a failure that produces no error and would only ever be noticed by an owner asking a
 * question in Tamil and getting an English transcript back.
 */
class OpenAiSpeechTranscriptionProviderTest {

    private static final String SECRET_KEY = "sk-test-must-never-appear-in-logs-4711";
    private static final String TRANSCRIPTIONS = "https://api.openai.com/v1/audio/transcriptions";

    private OpenAiSpeechTranscriptionProvider provider;
    private MockRestServiceServer mockServer;
    private ListAppender<ILoggingEvent> logAppender;
    private Logger providerLogger;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        // The mock has just installed its request factory on this builder — the constructor must
        // not overwrite it (see the adapter's Javadoc).
        provider = new OpenAiSpeechTranscriptionProvider(builder, SECRET_KEY, "whisper-1");

        providerLogger = (Logger) LoggerFactory.getLogger(OpenAiSpeechTranscriptionProvider.class);
        logAppender = new ListAppender<>();
        logAppender.start();
        providerLogger.addAppender(logAppender);
    }

    @AfterEach
    void tearDown() {
        providerLogger.detachAppender(logAppender);
    }

    private TranscriptionRequest request() {
        return new TranscriptionRequest("pretend-opus-bytes".getBytes(StandardCharsets.UTF_8),
                "audio/webm", "speech.webm", null);
    }

    private static String bodyOf(org.springframework.http.client.ClientHttpRequest request) {
        return new String(((MockClientHttpRequest) request).getBodyAsBytes(), StandardCharsets.UTF_8);
    }

    @Test
    void transcribesRatherThanTranslates() {
        mockServer.expect(requestTo(TRANSCRIPTIONS))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(json("What is MESA?", null), MediaType.APPLICATION_JSON));

        assertEquals("What is MESA?", provider.transcribe(request()).text());
        mockServer.verify();
    }

    @Test
    void uploadsTheAudioAsMultipartWithTheFilenameItWasGiven() {
        mockServer.expect(requestTo(TRANSCRIPTIONS))
                .andExpect(request -> {
                    String body = bodyOf(request);
                    assertTrue(body.contains("speech.webm"), "the generated filename should be the part filename");
                    assertTrue(body.contains("whisper-1"), "the model should come from configuration");
                    assertFalse(body.contains("language"), "no language should be forced when none was asked for");
                })
                .andRespond(withSuccess(json("Hello", null), MediaType.APPLICATION_JSON));

        provider.transcribe(request());
        mockServer.verify();
    }

    @Test
    void sendsALanguageOnlyWhenOneWasExplicitlyRequested() {
        mockServer.expect(requestTo(TRANSCRIPTIONS))
                .andExpect(request -> assertTrue(bodyOf(request).contains("language")))
                .andRespond(withSuccess(json("vanakkam", null), MediaType.APPLICATION_JSON));

        provider.transcribe(new TranscriptionRequest(
                "bytes".getBytes(StandardCharsets.UTF_8), "audio/webm", "speech.webm", "ta"));
        mockServer.verify();
    }

    @Test
    void keepsTamilScriptExactlyAsTheProviderReturnedIt() {
        String tamil = "MESA பற்றி சொல்லுங்கள்";
        mockServer.expect(requestTo(TRANSCRIPTIONS))
                .andRespond(withSuccess(json(tamil, "tamil"), MediaType.APPLICATION_JSON));

        TranscriptionResult result = provider.transcribe(request());
        assertEquals(tamil, result.text());
        assertEquals("tamil", result.detectedLanguage());
    }

    @Test
    void anAuthFailureIsPermanentAndIsNeverRetried() {
        mockServer.expect(times(1), requestTo(TRANSCRIPTIONS)).andRespond(withUnauthorizedRequest());
        assertThrows(ProviderPermanentException.class, () -> provider.transcribe(request()));
        mockServer.verify();
    }

    @Test
    void anInvalidRequestIsPermanentAndIsNeverRetried() {
        mockServer.expect(times(1), requestTo(TRANSCRIPTIONS)).andRespond(withBadRequest());
        assertThrows(ProviderPermanentException.class, () -> provider.transcribe(request()));
        mockServer.verify();
    }

    @Test
    void aRateLimitIsTransientAndIsRetriedExactlyOnce() {
        // Bounded on purpose: the visitor is standing there having just spoken, and a third
        // attempt is a worse experience than an honest "say that again".
        mockServer.expect(times(2), requestTo(TRANSCRIPTIONS)).andRespond(withTooManyRequests());
        assertThrows(ProviderTransientException.class, () -> provider.transcribe(request()));
        mockServer.verify();
    }

    @Test
    void aServerErrorIsTransientAndIsRetriedExactlyOnce() {
        mockServer.expect(times(2), requestTo(TRANSCRIPTIONS)).andRespond(withServerError());
        assertThrows(ProviderTransientException.class, () -> provider.transcribe(request()));
        mockServer.verify();
    }

    @Test
    void aRetriedCallThatSucceedsReturnsNormally() {
        mockServer.expect(times(1), requestTo(TRANSCRIPTIONS)).andRespond(withServerError());
        mockServer.expect(times(1), requestTo(TRANSCRIPTIONS))
                .andRespond(withSuccess(json("Second time lucky", null), MediaType.APPLICATION_JSON));

        assertEquals("Second time lucky", provider.transcribe(request()).text());
        mockServer.verify();
    }

    @Test
    void silenceIsAPermanentFailureRatherThanAnEmptyTranscript() {
        // Retrying the same bytes cannot produce different words, and an empty string reaching the
        // conversation pipeline would be a message the visitor never sent.
        mockServer.expect(times(1), requestTo(TRANSCRIPTIONS))
                .andRespond(withSuccess(json("   ", null), MediaType.APPLICATION_JSON));
        assertThrows(ProviderPermanentException.class, () -> provider.transcribe(request()));
    }

    @Test
    void neverLogsTheKeyOrAnythingKeyShaped() {
        mockServer.expect(requestTo(TRANSCRIPTIONS)).andRespond(withUnauthorizedRequest());
        assertThrows(ProviderPermanentException.class, () -> provider.transcribe(request()));

        for (ILoggingEvent event : logAppender.list) {
            String line = event.getFormattedMessage();
            assertFalse(line.contains(SECRET_KEY), "the API key must never be logged");
            assertFalse(line.contains("sk-"), "no key-shaped value may be logged");
        }
    }

    /** Builds a provider response body without hand-escaping JSON in a string literal. */
    private static String json(String text, String language) {
        String escaped = text.replace("\"", "");
        String body = "{" + quoted("text") + ":" + quoted(escaped);
        if (language != null) {
            body += "," + quoted("language") + ":" + quoted(language);
        }
        return body + "}";
    }

    private static String quoted(String value) {
        return "\"" + value + "\"";
    }
}
