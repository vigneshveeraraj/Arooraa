package com.arooraa.aura.provider.openai;

import com.arooraa.aura.provider.EmbeddingResult;
import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withTooManyRequests;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withUnauthorizedRequest;

/**
 * Proves {@link OpenAiEmbeddingProvider}'s error classification (resilience baseline) against a
 * mocked HTTP server — no real network call, no API key, so this runs in every normal test build.
 */
class OpenAiEmbeddingProviderTest {

    private OpenAiEmbeddingProvider provider;
    private MockRestServiceServer mockServer;

    private void build(int dimensions) {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        // The mock server has just installed its own request factory on this exact builder
        // instance — the provider's constructor must never overwrite it (see its Javadoc).
        provider = new OpenAiEmbeddingProvider(builder, "test-key", "text-embedding-3-small", dimensions);
    }

    @Test
    void successfulResponseReturnsTheVectorAndProviderName() {
        build(3);
        mockServer.expect(requestTo("https://api.openai.com/v1/embeddings"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("""
                        {"data":[{"embedding":[0.1,0.2,0.3],"index":0}],"model":"text-embedding-3-small"}
                        """, MediaType.APPLICATION_JSON));

        EmbeddingResult result = provider.embed("hello world");

        assertEquals(3, result.vector().length);
        assertEquals("openai", result.provider());
        assertEquals("text-embedding-3-small", result.model());
        mockServer.verify();
    }

    @Test
    void unauthorizedResponseIsClassifiedAsPermanentAndNotRetried() {
        build(3);
        mockServer.expect(requestTo("https://api.openai.com/v1/embeddings"))
                .andRespond(withUnauthorizedRequest());

        assertThrows(ProviderPermanentException.class, () -> provider.embed("hello"));
        mockServer.verify();
    }

    @Test
    void serverErrorIsClassifiedAsTransientAndRetriedUpToTheBoundedMaximum() {
        build(3);
        // MAX_ATTEMPTS = 3 — exactly three requests expected, never more (bounded, never unbounded).
        mockServer.expect(requestTo("https://api.openai.com/v1/embeddings")).andRespond(withServerError());
        mockServer.expect(requestTo("https://api.openai.com/v1/embeddings")).andRespond(withServerError());
        mockServer.expect(requestTo("https://api.openai.com/v1/embeddings")).andRespond(withServerError());

        assertThrows(ProviderTransientException.class, () -> provider.embed("hello"));
        mockServer.verify();
    }

    @Test
    void rateLimitedResponseIsClassifiedAsTransient() {
        build(3);
        mockServer.expect(requestTo("https://api.openai.com/v1/embeddings"))
                .andRespond(withTooManyRequests());
        mockServer.expect(requestTo("https://api.openai.com/v1/embeddings"))
                .andRespond(withSuccess("""
                        {"data":[{"embedding":[0.1,0.2,0.3],"index":0}],"model":"text-embedding-3-small"}
                        """, MediaType.APPLICATION_JSON));

        EmbeddingResult result = provider.embed("hello");

        assertEquals(3, result.vector().length, "should succeed on retry after a transient 429");
        mockServer.verify();
    }

    @Test
    void dimensionMismatchIsClassifiedAsPermanent() {
        build(1536);
        mockServer.expect(requestTo("https://api.openai.com/v1/embeddings"))
                .andRespond(withSuccess("""
                        {"data":[{"embedding":[0.1,0.2,0.3],"index":0}],"model":"text-embedding-3-small"}
                        """, MediaType.APPLICATION_JSON));

        assertThrows(ProviderPermanentException.class, () -> provider.embed("hello"));
        mockServer.verify();
    }

    @Test
    void badRequestResponseIsClassifiedAsPermanent() {
        build(3);
        mockServer.expect(requestTo("https://api.openai.com/v1/embeddings"))
                .andRespond(withBadRequest());

        assertThrows(ProviderPermanentException.class, () -> provider.embed("hello"));
        mockServer.verify();
    }
}
