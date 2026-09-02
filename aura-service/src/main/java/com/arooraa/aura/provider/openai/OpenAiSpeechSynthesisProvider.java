package com.arooraa.aura.provider.openai;

import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import com.arooraa.aura.provider.SpeechSynthesisProvider;
import com.arooraa.aura.provider.SynthesisRequest;
import com.arooraa.aura.provider.SynthesisResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;

/**
 * The first real {@link SpeechSynthesisProvider} adapter. Same rules as the other three OpenAI
 * adapters in this package: nothing vendor-specific escapes it, the model and voice come from
 * configuration, and neither the key nor the spoken text is logged.
 *
 * <p>The response is audio bytes, returned to the caller and streamed straight to the browser. No
 * file is written and nothing is cached: a replay asks again rather than keeping a copy of what
 * Aura said.
 */
public class OpenAiSpeechSynthesisProvider implements SpeechSynthesisProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiSpeechSynthesisProvider.class);
    private static final int MAX_ATTEMPTS = 2;
    private static final Duration RETRY_BACKOFF = Duration.ofMillis(400);

    /** The containers OpenAI can return, mapped to what the browser needs in a Content-Type. */
    private static final Map<String, String> MIME_BY_FORMAT = Map.of(
            "mp3", "audio/mpeg",
            "opus", "audio/ogg",
            "aac", "audio/aac",
            "flac", "audio/flac",
            "wav", "audio/wav",
            "pcm", "audio/L16");

    private final RestClient restClient;
    private final String model;

    public OpenAiSpeechSynthesisProvider(RestClient.Builder builder, String apiKey, String model) {
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
    public SynthesisResult synthesize(SynthesisRequest request) {
        ProviderTransientException lastFailure = null;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return doSynthesize(request);
            } catch (ProviderTransientException e) {
                lastFailure = e;
                if (attempt < MAX_ATTEMPTS) {
                    backoff();
                }
            }
        }
        throw lastFailure;
    }

    private SynthesisResult doSynthesize(SynthesisRequest request) {
        String format = MIME_BY_FORMAT.containsKey(request.format()) ? request.format() : "mp3";
        byte[] audio;
        try {
            audio = restClient.post()
                    .uri("/audio/speech")
                    .body(new OpenAiSpeechRequest(model, request.text(), request.voice(), format))
                    .retrieve()
                    .body(byte[].class);
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden e) {
            log.warn("OpenAI speech call rejected: authentication failure (status {})", e.getStatusCode().value());
            throw new ProviderPermanentException("OPENAI_AUTH_FAILED");
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.warn("OpenAI speech call rate-limited (status {})", e.getStatusCode().value());
            throw new ProviderTransientException("OPENAI_RATE_LIMITED");
        } catch (HttpClientErrorException e) {
            log.warn("OpenAI speech call rejected: invalid request (status {})", e.getStatusCode().value());
            throw new ProviderPermanentException("OPENAI_INVALID_REQUEST");
        } catch (HttpServerErrorException e) {
            log.warn("OpenAI speech call failed: server error (status {})", e.getStatusCode().value());
            throw new ProviderTransientException("OPENAI_SERVER_ERROR", e);
        } catch (ResourceAccessException e) {
            log.warn("OpenAI speech call failed: network/timeout error");
            throw new ProviderTransientException("OPENAI_NETWORK_ERROR", e);
        }

        if (audio == null || audio.length == 0) {
            throw new ProviderPermanentException("OPENAI_EMPTY_AUDIO");
        }
        return new SynthesisResult(audio, MIME_BY_FORMAT.get(format));
    }

    private void backoff() {
        try {
            Thread.sleep(RETRY_BACKOFF.toMillis());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ProviderTransientException("OPENAI_RETRY_INTERRUPTED", e);
        }
    }
}
