package com.arooraa.aura.support;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * A minimal HTTP client for the integration tests.
 *
 * <p>Spring Boot 4.1 no longer ships {@code TestRestTemplate}, and the tests here need something
 * that returns a failing status as data rather than throwing — half of what the chat API has to get
 * right is how it rejects things (400 for an oversized message, 404 for a disabled surface). So:
 * {@code exchange}, which hands back the raw response either way, plus the parsed JSON when there
 * is any.
 */
public final class HttpTestClient {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final RestClient restClient;

    public HttpTestClient(int port) {
        this.restClient = RestClient.builder().baseUrl("http://localhost:" + port).build();
    }

    /** Status, raw body, and the body parsed as a JSON object when it is one. */
    public record Response(int status, String rawBody, Map<String, Object> json) {

        public String string(String field) {
            Object value = json == null ? null : json.get(field);
            return value == null ? null : value.toString();
        }

        @SuppressWarnings("unchecked")
        public Map<String, Object> object(String field) {
            return json == null ? null : (Map<String, Object>) json.get(field);
        }

        @SuppressWarnings("unchecked")
        public java.util.List<Map<String, Object>> list(String field) {
            return json == null ? java.util.List.of()
                    : (java.util.List<Map<String, Object>>) json.getOrDefault(field, java.util.List.of());
        }
    }

    public Response post(String path, Object body) {
        return restClient.post()
                .uri(path)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body == null ? Map.of() : body)
                .exchange((request, response) -> toResponse(response.getStatusCode().value(), read(response)), false);
    }

    public Response get(String path) {
        return restClient.get()
                .uri(path)
                .exchange((request, response) -> toResponse(response.getStatusCode().value(), read(response)), false);
    }

    /**
     * A multipart upload, for the voice surface. Takes the media type and the filename separately
     * from the bytes, because half of what the audio validator has to get right is what it does
     * with each of them — including ignoring the filename entirely.
     */
    public Response postAudio(String path, byte[] audio, String contentType, String filename,
                               Integer durationMillis) {
        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        ByteArrayResource part = new ByteArrayResource(audio) {
            @Override
            public String getFilename() {
                return filename;
            }
        };
        HttpHeaders partHeaders = new HttpHeaders();
        if (contentType != null) {
            partHeaders.set(HttpHeaders.CONTENT_TYPE, contentType);
        }
        form.add("audio", new HttpEntity<>(part, partHeaders));
        if (durationMillis != null) {
            form.add("durationMs", durationMillis.toString());
        }

        return restClient.post()
                .uri(path)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(form)
                .exchange((request, response) -> toResponse(response.getStatusCode().value(), read(response)), false);
    }

    /** Status plus raw bytes — the speech endpoint returns audio, not JSON. */
    public record BinaryResponse(int status, byte[] body, String contentType, String cacheControl) {
    }

    public BinaryResponse postForBytes(String path, Object body) {
        return restClient.post()
                .uri(path)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body == null ? Map.of() : body)
                .exchange((request, response) -> {
                    try (var stream = response.getBody()) {
                        return new BinaryResponse(
                                response.getStatusCode().value(),
                                stream.readAllBytes(),
                                response.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE),
                                response.getHeaders().getFirst(HttpHeaders.CACHE_CONTROL));
                    }
                }, false);
    }

    private static String read(RestClient.RequestHeadersSpec.ConvertibleClientHttpResponse response) throws IOException {
        try (var body = response.getBody()) {
            return new String(body.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static Response toResponse(int status, String raw) {
        Map<String, Object> json = null;
        if (raw != null && raw.startsWith("{")) {
            try {
                json = MAPPER.readValue(raw, new TypeReference<Map<String, Object>>() { });
            } catch (RuntimeException e) {
                json = null;
            }
        }
        return new Response(status, raw, json);
    }
}
