package com.arooraa.aura.provider.openai;

import com.arooraa.aura.provider.ChatGenerationRequest;
import com.arooraa.aura.provider.ChatGenerationResult;
import com.arooraa.aura.provider.ChatMessage;
import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
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

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.ExpectedCount.times;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withTooManyRequests;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withUnauthorizedRequest;

/**
 * Error classification and credential safety for the real chat adapter, against a mocked HTTP
 * server — no network, no key, so it runs in every normal build.
 */
class OpenAiChatGenerationProviderTest {

    private static final String SECRET_KEY = "sk-test-must-never-appear-in-logs-4711";

    private OpenAiChatGenerationProvider provider;
    private MockRestServiceServer mockServer;
    private ListAppender<ILoggingEvent> logAppender;
    private Logger providerLogger;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        // The mock has just installed its request factory on this builder — the constructor must
        // not overwrite it (see the adapter's Javadoc).
        provider = new OpenAiChatGenerationProvider(builder, SECRET_KEY, "gpt-4o-mini");

        providerLogger = (Logger) LoggerFactory.getLogger(OpenAiChatGenerationProvider.class);
        logAppender = new ListAppender<>();
        logAppender.start();
        providerLogger.addAppender(logAppender);
    }

    @AfterEach
    void tearDown() {
        providerLogger.detachAppender(logAppender);
    }

    private ChatGenerationRequest request() {
        return new ChatGenerationRequest(List.of(
                new ChatMessage("system", "You are Aura."),
                new ChatMessage("user", "What is MESA?")), 0.6, 600);
    }

    @Test
    void aSuccessfulCallReturnsTheAnswerAndTheModelThatProducedIt() {
        mockServer.expect(requestTo("https://api.openai.com/v1/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.model").value("gpt-4o-mini"))
                .andExpect(jsonPath("$.messages[0].role").value("system"))
                .andExpect(jsonPath("$.max_completion_tokens").value(600))
                .andRespond(withSuccess("""
                        {"model":"gpt-4o-mini-2024-07-18",
                         "choices":[{"message":{"role":"assistant","content":"MESA is a restaurant platform."},
                                     "finish_reason":"stop"}],
                         "usage":{"prompt_tokens":120,"completion_tokens":18}}
                        """, MediaType.APPLICATION_JSON));

        ChatGenerationResult result = provider.generate(request());

        assertEquals("MESA is a restaurant platform.", result.content());
        assertEquals("gpt-4o-mini-2024-07-18", result.model());
        assertEquals(120, result.promptTokens());
        assertEquals(18, result.completionTokens());
        mockServer.verify();
    }

    @Test
    void authenticationFailureIsPermanentAndNeverRetried() {
        mockServer.expect(times(1), requestTo("https://api.openai.com/v1/chat/completions"))
                .andRespond(withUnauthorizedRequest());

        assertThrows(ProviderPermanentException.class, () -> provider.generate(request()));
        mockServer.verify();
    }

    @Test
    void anInvalidRequestIsPermanentAndNeverRetried() {
        mockServer.expect(times(1), requestTo("https://api.openai.com/v1/chat/completions"))
                .andRespond(withBadRequest());

        assertThrows(ProviderPermanentException.class, () -> provider.generate(request()));
        mockServer.verify();
    }

    @Test
    void aServerErrorIsTransientAndRetriedUpToTheBoundedMaximum() {
        mockServer.expect(times(3), requestTo("https://api.openai.com/v1/chat/completions"))
                .andRespond(withServerError());

        assertThrows(ProviderTransientException.class, () -> provider.generate(request()));
        mockServer.verify();
    }

    @Test
    void rateLimitingIsTransientAndRetried() {
        mockServer.expect(times(3), requestTo("https://api.openai.com/v1/chat/completions"))
                .andRespond(withTooManyRequests());

        assertThrows(ProviderTransientException.class, () -> provider.generate(request()));
        mockServer.verify();
    }

    @Test
    void aRetriedCallThatEventuallySucceedsReturnsTheAnswer() {
        mockServer.expect(times(1), requestTo("https://api.openai.com/v1/chat/completions"))
                .andRespond(withServerError());
        mockServer.expect(times(1), requestTo("https://api.openai.com/v1/chat/completions"))
                .andRespond(withSuccess("""
                        {"model":"gpt-4o-mini","choices":[{"message":{"role":"assistant","content":"Recovered."}}]}
                        """, MediaType.APPLICATION_JSON));

        assertEquals("Recovered.", provider.generate(request()).content());
        mockServer.verify();
    }

    @Test
    void anEmptyChoiceListIsPermanentRatherThanAnEmptyAnswer() {
        mockServer.expect(requestTo("https://api.openai.com/v1/chat/completions"))
                .andRespond(withSuccess("""
                        {"model":"gpt-4o-mini","choices":[]}
                        """, MediaType.APPLICATION_JSON));

        assertThrows(ProviderPermanentException.class, () -> provider.generate(request()));
    }

    @Test
    void theApiKeyNeverReachesTheLogsOnSuccessOrOnFailure() {
        mockServer.expect(times(3), requestTo("https://api.openai.com/v1/chat/completions"))
                .andRespond(withServerError());
        assertThrows(ProviderTransientException.class, () -> provider.generate(request()));

        mockServer.reset();
        mockServer.expect(requestTo("https://api.openai.com/v1/chat/completions"))
                .andRespond(withUnauthorizedRequest());
        assertThrows(ProviderPermanentException.class, () -> provider.generate(request()));

        for (ILoggingEvent event : logAppender.list) {
            assertFalse(event.getFormattedMessage().contains(SECRET_KEY),
                    "the API key must never appear in a log line: " + event.getFormattedMessage());
            assertFalse(event.getFormattedMessage().contains("Bearer "),
                    "no authorization header should ever be logged: " + event.getFormattedMessage());
        }
    }
}
