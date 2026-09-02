package com.arooraa.aura.provider.openai;

import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import com.arooraa.aura.provider.SpeechTranscriptionProvider;
import com.arooraa.aura.provider.TranscriptionRequest;
import com.arooraa.aura.provider.TranscriptionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * The first real {@link SpeechTranscriptionProvider} adapter, built to the same three rules as
 * {@link OpenAiChatGenerationProvider}: no OpenAI type escapes this package, the model comes from
 * configuration, and neither the credential nor the transcript is ever logged.
 *
 * <p>Calls {@code /audio/transcriptions} and deliberately never {@code /audio/translations}. The
 * translation endpoint always returns English, which would silently turn "MESA-வை பற்றி சொல்லுங்க"
 * into an English sentence and destroy exactly the Tamil and Tanglish support this milestone
 * exists to add. Transcription keeps the visitor's own words in the visitor's own script.
 *
 * <p>{@code languageHint} is normally null. Whisper detects language well on its own, and pinning
 * it to one code is what makes a code-mixed Tanglish utterance come out wrong — so the hint exists
 * for an operator who has a reason to force it, and is unset by default.
 */
public class OpenAiSpeechTranscriptionProvider implements SpeechTranscriptionProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiSpeechTranscriptionProvider.class);
    private static final int MAX_ATTEMPTS = 2;
    private static final Duration RETRY_BACKOFF = Duration.ofMillis(400);

    private final RestClient restClient;
    private final String model;

    public OpenAiSpeechTranscriptionProvider(RestClient.Builder builder, String apiKey, String model) {
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

    /**
     * Retried once, not three times. An audio upload is far larger than a chat prompt and the
     * visitor is standing there holding a microphone button; a second attempt is worth it, a third
     * is a worse experience than an honest "say that again".
     */
    @Override
    public TranscriptionResult transcribe(TranscriptionRequest request) {
        ProviderTransientException lastFailure = null;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return doTranscribe(request);
            } catch (ProviderTransientException e) {
                lastFailure = e;
                if (attempt < MAX_ATTEMPTS) {
                    backoff();
                }
            }
        }
        throw lastFailure;
    }

    private TranscriptionResult doTranscribe(TranscriptionRequest request) {
        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("file", filePart(request));
        form.add("model", model);
        // "json" rather than "verbose_json": we need the text and nothing else. Timestamps and
        // per-segment confidences would be provider internals with no consumer here.
        form.add("response_format", "json");
        if (request.languageHint() != null && !request.languageHint().isBlank()) {
            form.add("language", request.languageHint());
        }

        OpenAiTranscriptionResponse response;
        try {
            response = restClient.post()
                    .uri("/audio/transcriptions")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(form)
                    .retrieve()
                    .body(OpenAiTranscriptionResponse.class);
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden e) {
            log.warn("OpenAI transcription call rejected: authentication failure (status {})", e.getStatusCode().value());
            throw new ProviderPermanentException("OPENAI_AUTH_FAILED");
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.warn("OpenAI transcription call rate-limited (status {})", e.getStatusCode().value());
            throw new ProviderTransientException("OPENAI_RATE_LIMITED");
        } catch (HttpClientErrorException e) {
            log.warn("OpenAI transcription call rejected: invalid request (status {})", e.getStatusCode().value());
            throw new ProviderPermanentException("OPENAI_INVALID_REQUEST");
        } catch (HttpServerErrorException e) {
            log.warn("OpenAI transcription call failed: server error (status {})", e.getStatusCode().value());
            throw new ProviderTransientException("OPENAI_SERVER_ERROR", e);
        } catch (ResourceAccessException e) {
            log.warn("OpenAI transcription call failed: network/timeout error");
            throw new ProviderTransientException("OPENAI_NETWORK_ERROR", e);
        }

        if (response == null || response.text() == null || response.text().isBlank()) {
            // Silence, or a recording of nothing but room noise. Permanent because retrying the
            // same bytes cannot produce different words.
            throw new ProviderPermanentException("OPENAI_EMPTY_TRANSCRIPT");
        }
        return new TranscriptionResult(response.text().strip(), response.language());
    }

    /**
     * The filename OpenAI sees is the one this service generated from the validated media type —
     * see {@code AudioUploadValidator}. The browser's own filename never reaches here, so it can
     * neither pick the decoder nor appear in any path.
     */
    private ByteArrayResource filePart(TranscriptionRequest request) {
        return new ByteArrayResource(request.audio()) {
            @Override
            public String getFilename() {
                return request.filename();
            }
        };
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
