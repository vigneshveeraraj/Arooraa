package com.arooraa.leads.capture.whatsapp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.io.InputStream;
import java.net.ConnectException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpConnectTimeoutException;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

/**
 * Meta Cloud API: POST https://graph.facebook.com/{api-version}/{phone-number-id}/messages.
 * The host is a constant (never configurable), redirects are never followed, connect and request
 * timeouts are bounded and at most 64 KiB of a response is read (itself time-bounded). Outcomes
 * and logs carry codes only — never the token, recipient or text.
 *
 * Classification: 2xx with messages[0].id = Accepted; 2xx without a readable id = Unknown;
 * 429, or Meta's explicit throttling codes, or a connection that never opened = RetryableNotAccepted;
 * other 3xx/4xx (auth, permission, invalid recipient, window) = Terminal; 5xx, timeouts and
 * resets after the request was written = Unknown (Meta promises no send idempotency).
 */
public class CloudApiWhatsAppGateway implements WhatsAppGateway {

    static final String GRAPH_HOST = "graph.facebook.com";
    static final int MAX_RESPONSE_BYTES = 64 * 1024;
    static final Duration MAX_RETRY_AFTER = Duration.ofMinutes(15);
    private static final Pattern META_MESSAGE_ID = Pattern.compile("^[A-Za-z0-9._=:+/\\-]{1,200}$");
    /** Graph/WhatsApp throttling codes: request was not accepted. */
    private static final java.util.Set<Long> THROTTLING_CODES = java.util.Set.of(4L, 80007L, 130429L, 131056L);
    private static final Logger log = LoggerFactory.getLogger(CloudApiWhatsAppGateway.class);

    private final URI endpoint;
    private final String authorization;
    private final Duration requestTimeout;
    private final JsonMapper json;
    private final HttpClient http;

    public CloudApiWhatsAppGateway(WhatsAppProperties properties, JsonMapper json) {
        this.endpoint = endpoint(properties.apiVersion(), properties.phoneNumberId());
        this.authorization = "Bearer " + properties.accessToken();
        this.requestTimeout = properties.requestTimeout();
        this.json = json;
        this.http = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(properties.connectTimeout())
                .build();
    }

    static URI endpoint(String apiVersion, String phoneNumberId) {
        if (!WhatsAppProperties.API_VERSION.matcher(apiVersion).matches()
                || !WhatsAppProperties.META_ID.matcher(phoneNumberId).matches()) {
            throw new IllegalStateException("Invalid WhatsApp api-version or phone-number-id");
        }
        return URI.create("https://" + GRAPH_HOST + "/" + apiVersion + "/" + phoneNumberId + "/messages");
    }

    byte[] requestBody(UUID correlationId, String recipientDigits, String body) {
        ObjectNode root = json.createObjectNode()
                .put("messaging_product", "whatsapp")
                .put("recipient_type", "individual")
                .put("to", recipientDigits)
                .put("type", "text")
                .put("biz_opaque_callback_data", correlationId.toString());
        root.putObject("text").put("preview_url", false).put("body", body);
        return json.writeValueAsBytes(root);
    }

    @Override
    public SendOutcome sendText(UUID correlationId, String recipientDigits, String body) {
        HttpRequest request = HttpRequest.newBuilder(endpoint)
                .timeout(requestTimeout)
                .header("Authorization", authorization)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofByteArray(requestBody(correlationId, recipientDigits, body)))
                .build();
        SendOutcome outcome;
        try {
            HttpResponse<InputStream> response = http.send(request, HttpResponse.BodyHandlers.ofInputStream());
            byte[] responseBody = readBounded(response.body());
            outcome = classify(response.statusCode(), response.headers().firstValue("Retry-After"), responseBody);
        } catch (HttpConnectTimeoutException | ConnectException e) {
            outcome = new RetryableNotAccepted("CONNECT_FAILED", null);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            outcome = new Unknown("INTERRUPTED");
        } catch (IOException | RuntimeException e) {
            outcome = new Unknown(e instanceof java.net.http.HttpTimeoutException ? "TIMEOUT" : "IO_ERROR");
        }
        log.info("whatsapp-gateway send correlationId={} outcome={}", correlationId, outcome.getClass().getSimpleName());
        return outcome;
    }

    /** Reads at most {@link #MAX_RESPONSE_BYTES}, giving up (empty) after the request timeout. */
    private byte[] readBounded(InputStream in) {
        CompletableFuture<byte[]> read = CompletableFuture.supplyAsync(() -> {
            try (in) {
                return in.readNBytes(MAX_RESPONSE_BYTES);
            } catch (IOException e) {
                return new byte[0];
            }
        }, task -> Thread.ofVirtual().start(task));
        try {
            return read.get(requestTimeout.toMillis(), TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            try {
                in.close();
            } catch (IOException ignored) {
                // best effort
            }
            return new byte[0];
        }
    }

    SendOutcome classify(int status, Optional<String> retryAfterHeader, byte[] body) {
        JsonNode root = parse(body);
        if (status >= 200 && status < 300) {
            String id = root.path("messages").path(0).path("id").asString("");
            return META_MESSAGE_ID.matcher(id).matches() ? new Accepted(id) : new Unknown("UNREADABLE_2XX");
        }
        long metaCode = root.path("error").path("code").asLong(-1);
        String code = metaCode >= 0 ? "META_" + Math.min(metaCode, 9_999_999L) : "HTTP_" + status;
        if (status == 429 || (status >= 400 && status < 500 && THROTTLING_CODES.contains(metaCode))) {
            return new RetryableNotAccepted(status == 429 ? "HTTP_429" : code, retryAfter(retryAfterHeader));
        }
        if (status == 401 || status == 403) {
            return new Terminal("AUTH_" + code);
        }
        if (status >= 300 && status < 500) {
            return new Terminal(code);
        }
        return new Unknown(status >= 500 ? "HTTP_5XX" : "HTTP_" + status);
    }

    /** Seconds only, clamped to 0..15 min; anything unparseable is ignored (policy backoff applies). */
    static Duration retryAfter(Optional<String> header) {
        if (header.isEmpty() || !header.get().trim().matches("^[0-9]{1,9}$")) {
            return null;
        }
        Duration requested = Duration.ofSeconds(Long.parseLong(header.get().trim()));
        return requested.compareTo(MAX_RETRY_AFTER) > 0 ? MAX_RETRY_AFTER : requested;
    }

    private JsonNode parse(byte[] body) {
        try {
            JsonNode node = body.length == 0 ? null : json.readTree(body);
            return node == null ? json.createObjectNode() : node;
        } catch (RuntimeException e) {
            return json.createObjectNode();
        }
    }
}
