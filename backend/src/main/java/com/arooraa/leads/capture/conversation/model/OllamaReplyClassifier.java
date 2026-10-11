package com.arooraa.leads.capture.conversation.model;

import com.arooraa.leads.capture.conversation.QuestionStep;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Classifies a reply with a model served by a local Ollama (no paid service, nothing leaves the
 * machine). Ollama's structured outputs constrain decoding to a JSON schema whose enums are the
 * step's allowed values, and the result is validated again here, so the model can only ever
 * pick from a closed set.
 *
 * Every failure mode degrades to {@link Optional#empty()} — the caller then uses the rules:
 * <ul>
 *   <li>the configured model isn't installed (checked against {@code /api/tags}; the optional
 *       fallback model is tried before giving up),</li>
 *   <li>a request exceeds {@code timeout} (a cold model load counts — see {@link #warmUp()}),</li>
 *   <li>malformed JSON or a value outside the allowed set,</li>
 *   <li>after {@code failureThreshold} consecutive failures the model is skipped entirely for
 *       {@code cooldown}, so an Ollama outage doesn't add a timeout to every message.</li>
 * </ul>
 */
public class OllamaReplyClassifier implements ModelReplyClassifier {

    private static final Logger log = LoggerFactory.getLogger(OllamaReplyClassifier.class);
    private static final Set<String> INTENTS = Set.of("ANSWER", "PRICE_QUESTION", "HUMAN", "UNCLEAR");
    private static final String NONE = "NONE";
    private static final int MAX_INPUT_CHARS = 500;

    private final URI baseUri;
    private final List<String> candidateModels;
    private final Duration timeout;
    private final String keepAlive;
    private final int failureThreshold;
    private final Duration cooldown;
    private final HttpClient http;
    private final JsonMapper json;
    private final Clock clock;

    private volatile String resolvedModel;
    private volatile Instant nextAvailabilityCheck = Instant.EPOCH;
    private volatile Instant openUntil = Instant.EPOCH;
    private int consecutiveFailures;

    public OllamaReplyClassifier(LeadAssistantModelProperties properties, JsonMapper json, Clock clock) {
        this.baseUri = URI.create(properties.baseUrl().endsWith("/") ? properties.baseUrl() : properties.baseUrl() + "/");
        List<String> models = new ArrayList<>();
        models.add(properties.model());
        if (properties.fallbackModel() != null && !properties.fallbackModel().isBlank()
                && !properties.fallbackModel().equals(properties.model())) {
            models.add(properties.fallbackModel());
        }
        this.candidateModels = List.copyOf(models);
        this.timeout = properties.timeout();
        this.keepAlive = properties.keepAlive();
        this.failureThreshold = properties.failureThreshold();
        this.cooldown = properties.cooldown();
        this.http = HttpClient.newBuilder().connectTimeout(properties.connectTimeout()).build();
        this.json = json;
        this.clock = clock;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String describe() {
        String model = resolvedModel;
        return "ollama:" + (model != null ? model : candidateModels.getFirst());
    }

    @Override
    public Optional<ModelVerdict> classify(QuestionStep step, String customerText) {
        Instant now = clock.instant();
        if (now.isBefore(openUntil)) {
            return Optional.empty();
        }
        String model = resolveModel(now);
        if (model == null) {
            return Optional.empty();
        }
        try {
            HttpRequest request = HttpRequest.newBuilder(baseUri.resolve("api/chat"))
                    .timeout(timeout)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(chatRequest(model, step, customerText))))
                    .build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return failure("HTTP_" + response.statusCode());
            }
            Optional<ModelVerdict> verdict = parse(step, response.body());
            if (verdict.isEmpty()) {
                return failure("INVALID_OUTPUT");
            }
            recordSuccess();
            return verdict;
        } catch (java.net.http.HttpTimeoutException e) {
            return failure("TIMEOUT");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return failure("INTERRUPTED");
        } catch (Exception e) {
            return failure(e.getClass().getSimpleName());
        }
    }

    /**
     * Loads the model into memory ahead of the first customer message (a cold load takes several
     * seconds, longer than {@code timeout}). An empty prompt makes Ollama load without generating.
     */
    public void warmUp() {
        String model = resolveModel(clock.instant());
        if (model == null) {
            return;
        }
        try {
            ObjectNode body = json.createObjectNode().put("model", model).put("keep_alive", keepAlive);
            HttpRequest request = HttpRequest.newBuilder(baseUri.resolve("api/generate"))
                    .timeout(Duration.ofMinutes(2))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)))
                    .build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("lead-assistant model warm-up model={} status={}", model, response.statusCode());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.warn("lead-assistant model warm-up failed model={} error={}", model, e.getClass().getSimpleName());
        }
    }

    /** The first configured model Ollama actually has installed, re-checked at most once per cooldown. */
    private String resolveModel(Instant now) {
        String current = resolvedModel;
        if (current != null || now.isBefore(nextAvailabilityCheck)) {
            return current;
        }
        nextAvailabilityCheck = now.plus(cooldown);
        try {
            HttpRequest request = HttpRequest.newBuilder(baseUri.resolve("api/tags")).timeout(timeout).GET().build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("lead-assistant model unavailable reason=TAGS_HTTP_{}", response.statusCode());
                return null;
            }
            Set<String> installed = new java.util.HashSet<>();
            for (JsonNode m : json.readTree(response.body()).path("models")) {
                installed.add(m.path("name").asString(""));
                installed.add(m.path("model").asString(""));
            }
            for (String candidate : candidateModels) {
                if (installed.contains(candidate)) {
                    if (!candidate.equals(candidateModels.getFirst())) {
                        log.warn("lead-assistant using fallback model={} (configured model not installed)", candidate);
                    }
                    resolvedModel = candidate;
                    return candidate;
                }
            }
            log.warn("lead-assistant model unavailable reason=NOT_INSTALLED candidates={}", candidateModels);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.warn("lead-assistant model unavailable reason={}", e.getClass().getSimpleName());
        }
        return null;
    }

    private ObjectNode chatRequest(String model, QuestionStep step, String customerText) {
        String text = customerText.length() > MAX_INPUT_CHARS ? customerText.substring(0, MAX_INPUT_CHARS) : customerText;

        ObjectNode schema = json.createObjectNode().put("type", "object");
        ObjectNode props = schema.putObject("properties");
        ArrayNode intentEnum = props.putObject("intent").put("type", "string").putArray("enum");
        INTENTS.stream().sorted().forEach(intentEnum::add);
        ArrayNode valueEnum = props.putObject("value").put("type", "string").putArray("enum");
        step.allowedValues().forEach(valueEnum::add);
        valueEnum.add(NONE);
        schema.putArray("required").add("intent").add("value");

        ObjectNode body = json.createObjectNode()
                .put("model", model)
                .put("stream", false)
                .put("keep_alive", keepAlive);
        body.set("format", schema);
        body.putObject("options").put("temperature", 0).put("num_predict", 48);
        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "system").put("content", ClassifierPrompt.system(step));
        messages.addObject().put("role", "user").put("content", "Customer message:\n<<<\n" + text + "\n>>>");
        return body;
    }

    /** Strict: unknown intent, out-of-set value, or ANSWER without a value all count as invalid. */
    Optional<ModelVerdict> parse(QuestionStep step, String responseBody) {
        try {
            String content = json.readTree(responseBody).path("message").path("content").asString("");
            JsonNode verdict = json.readTree(content);
            String intent = verdict.path("intent").asString("");
            String value = verdict.path("value").asString(NONE);
            if (!INTENTS.contains(intent)) {
                return Optional.empty();
            }
            if (!"ANSWER".equals(intent)) {
                return Optional.of(new ModelVerdict(intent, null));
            }
            if (step.isFreeText()) {
                return Optional.of(new ModelVerdict(intent, null));
            }
            return step.allowedValues().contains(value) ? Optional.of(new ModelVerdict(intent, value)) : Optional.empty();
        } catch (RuntimeException e) {
            return Optional.empty();
        }
    }

    private synchronized void recordSuccess() {
        consecutiveFailures = 0;
    }

    private synchronized Optional<ModelVerdict> failure(String reason) {
        consecutiveFailures++;
        if (consecutiveFailures >= failureThreshold) {
            openUntil = clock.instant().plus(cooldown);
            consecutiveFailures = 0;
            // A model that keeps failing may have been unloaded or removed; look it up again later.
            resolvedModel = null;
            nextAvailabilityCheck = openUntil;
            log.warn("lead-assistant model paused for {}s after repeated failures lastError={}", cooldown.toSeconds(), reason);
        } else {
            log.info("lead-assistant model fallback reason={}", reason);
        }
        return Optional.empty();
    }
}
