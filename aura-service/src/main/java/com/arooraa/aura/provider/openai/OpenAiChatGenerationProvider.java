package com.arooraa.aura.provider.openai;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.ChatGenerationRequest;
import com.arooraa.aura.provider.ChatGenerationResult;
import com.arooraa.aura.provider.ChatMessage;
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
 * The first real {@link ChatGenerationProvider} adapter, built to the same rules as
 * {@link OpenAiEmbeddingProvider}: no OpenAI type escapes this package, the model comes from
 * configuration, and nothing about the credential or the raw response is ever logged.
 *
 * <p>Error classification mirrors the embedding adapter — auth failures and other 4xx are
 * permanent and never retried, rate limits, 5xx and network faults are transient and retried a
 * bounded number of times. The caller ({@code ConversationOrchestrator}) turns either into a
 * natural apology rather than an error page, so a provider outage degrades the conversation
 * instead of breaking it.
 */
public class OpenAiChatGenerationProvider implements ChatGenerationProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiChatGenerationProvider.class);
    private static final int MAX_ATTEMPTS = 3;
    private static final Duration[] RETRY_BACKOFF = {Duration.ofMillis(300), Duration.ofMillis(700)};

    private final RestClient restClient;
    private final String model;

    /**
     * Takes an already-transport-configured builder and adds only the base URL and auth header —
     * deliberately never calling {@code requestFactory(...)} itself, so a test may bind a mock
     * server to the same builder without this constructor overwriting it.
     */
    public OpenAiChatGenerationProvider(RestClient.Builder builder, String apiKey, String model) {
        this.model = model;
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
    public ChatGenerationResult generate(ChatGenerationRequest request) {
        ProviderTransientException lastFailure = null;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return doGenerate(request);
            } catch (ProviderTransientException e) {
                lastFailure = e;
                if (attempt < MAX_ATTEMPTS) {
                    backoff(RETRY_BACKOFF[attempt - 1]);
                }
            }
        }
        throw lastFailure;
    }

    private ChatGenerationResult doGenerate(ChatGenerationRequest request) {
        List<OpenAiChatRequest.Message> messages = request.messages().stream()
                .map(this::toWireMessage)
                .toList();

        OpenAiChatResponse response;
        try {
            response = restClient.post()
                    .uri("/chat/completions")
                    .body(new OpenAiChatRequest(model, messages, request.temperature(), request.maxOutputTokens()))
                    .retrieve()
                    .body(OpenAiChatResponse.class);
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden e) {
            log.warn("OpenAI chat call rejected: authentication failure (status {})", e.getStatusCode().value());
            throw new ProviderPermanentException("OPENAI_AUTH_FAILED");
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.warn("OpenAI chat call rate-limited (status {})", e.getStatusCode().value());
            throw new ProviderTransientException("OPENAI_RATE_LIMITED");
        } catch (HttpClientErrorException e) {
            log.warn("OpenAI chat call rejected: invalid request (status {})", e.getStatusCode().value());
            throw new ProviderPermanentException("OPENAI_INVALID_REQUEST");
        } catch (HttpServerErrorException e) {
            log.warn("OpenAI chat call failed: server error (status {})", e.getStatusCode().value());
            throw new ProviderTransientException("OPENAI_SERVER_ERROR", e);
        } catch (ResourceAccessException e) {
            log.warn("OpenAI chat call failed: network/timeout error");
            throw new ProviderTransientException("OPENAI_NETWORK_ERROR", e);
        }

        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new ProviderPermanentException("OPENAI_EMPTY_RESPONSE");
        }
        OpenAiChatResponse.Choice choice = response.choices().get(0);
        if (choice.message() == null || choice.message().content() == null || choice.message().content().isBlank()) {
            throw new ProviderPermanentException("OPENAI_EMPTY_CONTENT");
        }

        return new ChatGenerationResult(
                choice.message().content().strip(),
                response.model() != null ? response.model() : model,
                response.usage() != null ? response.usage().promptTokens() : null,
                response.usage() != null ? response.usage().completionTokens() : null);
    }

    private OpenAiChatRequest.Message toWireMessage(ChatMessage message) {
        return new OpenAiChatRequest.Message(message.role(), message.content());
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
