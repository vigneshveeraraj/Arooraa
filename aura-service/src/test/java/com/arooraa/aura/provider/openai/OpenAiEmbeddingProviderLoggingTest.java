package com.arooraa.aura.provider.openai;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withUnauthorizedRequest;

/**
 * Proves the credential-safety half of the resilience baseline directly: whatever
 * {@link OpenAiEmbeddingProvider} logs — success, auth failure, or exhausted transient retries —
 * never contains the API key. Captures real log output via a Logback {@link ListAppender} rather
 * than trusting the source code alone, so a future edit that accidentally starts logging the key
 * (e.g. in a broadened exception message) fails this test immediately.
 */
class OpenAiEmbeddingProviderLoggingTest {

    private static final String SECRET_KEY = "sk-test-super-secret-key-must-never-appear-in-logs";

    private ListAppender<ILoggingEvent> appender;
    private Logger providerLogger;

    @BeforeEach
    void attachAppender() {
        providerLogger = (Logger) LoggerFactory.getLogger(OpenAiEmbeddingProvider.class);
        appender = new ListAppender<>();
        appender.start();
        providerLogger.addAppender(appender);
    }

    @AfterEach
    void detachAppender() {
        providerLogger.detachAppender(appender);
    }

    private OpenAiEmbeddingProvider buildProviderWithServer(int dimensions, MockRestServiceServer[] serverOut) {
        RestClient.Builder builder = RestClient.builder();
        serverOut[0] = MockRestServiceServer.bindTo(builder).build();
        return new OpenAiEmbeddingProvider(builder, SECRET_KEY, "text-embedding-3-small", dimensions);
    }

    @Test
    void successfulCallNeverLogsTheApiKey() {
        MockRestServiceServer[] serverHolder = new MockRestServiceServer[1];
        OpenAiEmbeddingProvider provider = buildProviderWithServer(3, serverHolder);
        serverHolder[0].expect(requestTo("https://api.openai.com/v1/embeddings"))
                .andRespond(withSuccess("""
                        {"data":[{"embedding":[0.1,0.2,0.3],"index":0}],"model":"text-embedding-3-small"}
                        """, MediaType.APPLICATION_JSON));

        provider.embed("hello");

        assertNoLogContainsTheKey();
    }

    @Test
    void authFailureNeverLogsTheApiKey() {
        MockRestServiceServer[] serverHolder = new MockRestServiceServer[1];
        OpenAiEmbeddingProvider provider = buildProviderWithServer(3, serverHolder);
        serverHolder[0].expect(requestTo("https://api.openai.com/v1/embeddings"))
                .andRespond(withUnauthorizedRequest());

        assertThrows(ProviderPermanentException.class, () -> provider.embed("hello"));

        assertNoLogContainsTheKey();
    }

    @Test
    void exhaustedTransientRetriesNeverLogTheApiKey() {
        MockRestServiceServer[] serverHolder = new MockRestServiceServer[1];
        OpenAiEmbeddingProvider provider = buildProviderWithServer(3, serverHolder);
        serverHolder[0].expect(requestTo("https://api.openai.com/v1/embeddings")).andRespond(withServerError());
        serverHolder[0].expect(requestTo("https://api.openai.com/v1/embeddings")).andRespond(withServerError());
        serverHolder[0].expect(requestTo("https://api.openai.com/v1/embeddings")).andRespond(withServerError());

        assertThrows(ProviderTransientException.class, () -> provider.embed("hello"));

        assertNoLogContainsTheKey();
    }

    private void assertNoLogContainsTheKey() {
        for (ILoggingEvent event : appender.list) {
            assertFalse(event.getFormattedMessage().contains(SECRET_KEY),
                    "log message must never contain the API key: " + event.getFormattedMessage());
        }
    }
}
