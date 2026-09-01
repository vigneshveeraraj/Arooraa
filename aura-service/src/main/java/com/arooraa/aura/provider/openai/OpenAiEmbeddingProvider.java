package com.arooraa.aura.provider.openai;

import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.EmbeddingResult;
import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;

/**
 * The one real {@link EmbeddingProvider} adapter shipped in A2. Deliberately confined to this
 * package — no OpenAI-specific type (this class, its request/response records) is referenced from
 * {@code knowledge}, {@code retrieval} or {@code ingestion} packages; they only ever see
 * {@link EmbeddingProvider}/{@link EmbeddingResult} (frozen architecture requirement).
 *
 * <p>Error classification (resilience baseline): authentication failures, other 4xx, and a
 * returned vector whose dimension doesn't match configuration are {@link ProviderPermanentException}
 * — never retried. Timeouts, network failures, 5xx and 429 (rate limit) are
 * {@link ProviderTransientException} — retried up to {@link #MAX_ATTEMPTS} times with a short
 * fixed backoff, never unbounded. Never logs the API key or the raw response body — only a safe,
 * short error code and the HTTP status.
 */
public class OpenAiEmbeddingProvider implements EmbeddingProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiEmbeddingProvider.class);
    private static final int MAX_ATTEMPTS = 3;
    private static final Duration[] RETRY_BACKOFF = {Duration.ofMillis(200), Duration.ofMillis(400)};

    private final RestClient restClient;
    private final String model;
    private final int dimensions;

    /**
     * Takes an already-transport-configured {@link RestClient.Builder} (timeouts etc. are a
     * caller/config concern — see {@code ProviderConfiguration}) and only adds the API-specific
     * base URL and auth header before building. Deliberately never touches
     * {@code builder.requestFactory(...)} itself: a test can bind {@code MockRestServiceServer} to
     * the same builder beforehand and be sure this constructor won't overwrite that mock factory.
     */
    public OpenAiEmbeddingProvider(RestClient.Builder builder, String apiKey, String model, int dimensions) {
        this.model = model;
        this.dimensions = dimensions;
        this.restClient = builder
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public int dimensions() {
        return dimensions;
    }

    @Override
    public EmbeddingResult embed(String text) {
        ProviderTransientException lastFailure = null;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return doEmbed(text);
            } catch (ProviderTransientException e) {
                lastFailure = e;
                if (attempt < MAX_ATTEMPTS) {
                    backoff(RETRY_BACKOFF[attempt - 1]);
                }
            }
        }
        throw lastFailure;
    }

    private EmbeddingResult doEmbed(String text) {
        OpenAiEmbeddingResponse response;
        try {
            response = restClient.post()
                    .uri("/embeddings")
                    .body(new OpenAiEmbeddingRequest(model, text))
                    .retrieve()
                    .body(OpenAiEmbeddingResponse.class);
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden e) {
            log.warn("OpenAI embedding call rejected: authentication failure (status {})", e.getStatusCode().value());
            throw new ProviderPermanentException("OPENAI_AUTH_FAILED");
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.warn("OpenAI embedding call rate-limited (status {})", e.getStatusCode().value());
            throw new ProviderTransientException("OPENAI_RATE_LIMITED");
        } catch (HttpClientErrorException e) {
            log.warn("OpenAI embedding call rejected: invalid request (status {})", e.getStatusCode().value());
            throw new ProviderPermanentException("OPENAI_INVALID_REQUEST");
        } catch (HttpServerErrorException e) {
            log.warn("OpenAI embedding call failed: server error (status {})", e.getStatusCode().value());
            throw new ProviderTransientException("OPENAI_SERVER_ERROR", e);
        } catch (ResourceAccessException e) {
            log.warn("OpenAI embedding call failed: network/timeout error");
            throw new ProviderTransientException("OPENAI_NETWORK_ERROR", e);
        }

        if (response == null || response.data() == null || response.data().isEmpty()) {
            throw new ProviderPermanentException("OPENAI_EMPTY_RESPONSE");
        }

        List<Float> raw = response.data().get(0).embedding();
        float[] vector = new float[raw.size()];
        for (int i = 0; i < raw.size(); i++) {
            vector[i] = raw.get(i);
        }
        if (vector.length != dimensions) {
            throw new ProviderPermanentException("OPENAI_EMBEDDING_DIMENSION_MISMATCH");
        }

        return new EmbeddingResult(vector, response.model() != null ? response.model() : model, "openai");
    }

    private void backoff(Duration duration) {
        try {
            Thread.sleep(duration.toMillis());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ProviderTransientException("OPENAI_RETRY_INTERRUPTED", e);
        }
    }
}
