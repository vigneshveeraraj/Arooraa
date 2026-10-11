package com.arooraa.leads.capture.conversation.model;

import com.arooraa.leads.capture.conversation.QuestionStep;
import com.arooraa.leads.capture.conversation.model.ModelReplyClassifier.ModelVerdict;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OllamaReplyClassifierTest {

    private final JsonMapper json = JsonMapper.builder().build();
    private HttpServer server;
    private final List<String> installed = new CopyOnWriteArrayList<>(List.of("qwen3-vl:4b-instruct"));
    private final AtomicReference<String> chatContent = new AtomicReference<>("{\"intent\":\"ANSWER\",\"value\":\"EVENING\"}");
    private final AtomicInteger chatStatus = new AtomicInteger(200);
    private final AtomicInteger chatDelayMs = new AtomicInteger(0);
    private final AtomicInteger chatCalls = new AtomicInteger();
    private final AtomicReference<JsonNode> lastChatRequest = new AtomicReference<>();

    @BeforeEach
    void startFakeOllama() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/api/tags", ex -> {
            StringBuilder models = new StringBuilder();
            for (String name : installed) {
                models.append(models.isEmpty() ? "" : ",").append("{\"name\":\"").append(name).append("\",\"model\":\"")
                        .append(name).append("\"}");
            }
            respond(ex, 200, "{\"models\":[" + models + "]}");
        });
        server.createContext("/api/chat", ex -> {
            chatCalls.incrementAndGet();
            lastChatRequest.set(json.readTree(ex.getRequestBody().readAllBytes()));
            try {
                Thread.sleep(chatDelayMs.get());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            String body = json.createObjectNode().set("message",
                    json.createObjectNode().put("role", "assistant").put("content", chatContent.get())).toString();
            respond(ex, chatStatus.get(), body);
        });
        server.setExecutor(java.util.concurrent.Executors.newCachedThreadPool());
        server.start();
    }

    @AfterEach
    void stop() {
        server.stop(0);
    }

    private static void respond(HttpExchange ex, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, bytes.length);
        ex.getResponseBody().write(bytes);
        ex.close();
    }

    private OllamaReplyClassifier classifier(String baseUrl, String fallback, Clock clock) {
        return new OllamaReplyClassifier(new LeadAssistantModelProperties("ollama", baseUrl, "qwen3-vl:4b-instruct",
                fallback, Duration.ofMillis(500), Duration.ofMillis(800), "30m", 2, Duration.ofSeconds(60), false),
                json, clock);
    }

    private OllamaReplyClassifier classifier() {
        return classifier("http://127.0.0.1:" + server.getAddress().getPort(), "", Clock.systemUTC());
    }

    @Test
    void returnsAValidatedVerdictAndConstrainsTheModelToTheStepsValues() {
        Optional<ModelVerdict> verdict = classifier().classify(QuestionStep.CALL_TIME, "office mudinja apram");

        assertEquals(Optional.of(new ModelVerdict("ANSWER", "EVENING")), verdict);
        JsonNode request = lastChatRequest.get();
        assertEquals("qwen3-vl:4b-instruct", request.path("model").asString());
        assertEquals(false, request.path("stream").asBoolean());
        assertEquals("[\"MORNING\",\"AFTERNOON\",\"EVENING\",\"NONE\"]",
                request.path("format").path("properties").path("value").path("enum").toString());
        assertTrue(request.path("messages").get(1).path("content").asString().contains("<<<\noffice mudinja apram\n>>>"));
    }

    @Test
    void anAnswerOutsideTheAllowedValuesIsRejected() {
        chatContent.set("{\"intent\":\"ANSWER\",\"value\":\"MIDNIGHT\"}");
        assertTrue(classifier().classify(QuestionStep.CALL_TIME, "x").isEmpty());

        chatContent.set("{\"intent\":\"QUOTE_PRICE\",\"value\":\"NONE\"}");
        assertTrue(classifier().classify(QuestionStep.CALL_TIME, "x").isEmpty());

        chatContent.set("Sure! The website costs Rs 5000.");
        assertTrue(classifier().classify(QuestionStep.CALL_TIME, "x").isEmpty());
    }

    @Test
    void freeTextStepsNeverReturnModelWrittenValues() {
        chatContent.set("{\"intent\":\"ANSWER\",\"value\":\"A bakery that sells for ₹100\"}");
        assertEquals(Optional.of(new ModelVerdict("ANSWER", null)),
                classifier().classify(QuestionStep.BUSINESS_TYPE, "naan oru bakery vechirukken"));
    }

    @Test
    void usesTheFallbackModelWhenTheConfiguredOneIsNotInstalled() {
        installed.clear();
        installed.add("qwen2.5:3b");

        OllamaReplyClassifier classifier = classifier("http://127.0.0.1:" + server.getAddress().getPort(), "qwen2.5:3b",
                Clock.systemUTC());

        assertTrue(classifier.classify(QuestionStep.CALL_TIME, "x").isPresent());
        assertEquals("qwen2.5:3b", lastChatRequest.get().path("model").asString());
        assertEquals("ollama:qwen2.5:3b", classifier.describe());
    }

    @Test
    void noInstalledModelMeansNoCallAndNoVerdict() {
        installed.clear();

        assertTrue(classifier().classify(QuestionStep.CALL_TIME, "x").isEmpty());
        assertEquals(0, chatCalls.get());
    }

    @Test
    void anUnreachableOllamaDegradesToNoVerdict() {
        server.stop(0);
        OllamaReplyClassifier classifier = classifier("http://127.0.0.1:" + server.getAddress().getPort(), "", Clock.systemUTC());

        assertTrue(classifier.classify(QuestionStep.CALL_TIME, "x").isEmpty());
    }

    @Test
    void aSlowModelTimesOutAndRepeatedFailuresPauseTheModel() {
        MutableClock clock = new MutableClock();
        OllamaReplyClassifier classifier = classifier("http://127.0.0.1:" + server.getAddress().getPort(), "", clock);
        chatDelayMs.set(1500);

        long started = System.nanoTime();
        assertTrue(classifier.classify(QuestionStep.CALL_TIME, "x").isEmpty());
        assertTrue(Duration.ofNanos(System.nanoTime() - started).toMillis() < 1400, "request timeout must bound latency");

        chatDelayMs.set(0);
        chatStatus.set(500);
        assertTrue(classifier.classify(QuestionStep.CALL_TIME, "x").isEmpty());
        int callsWhenPaused = chatCalls.get();

        // Threshold (2) reached: the model is skipped entirely during the cooldown.
        chatStatus.set(200);
        assertTrue(classifier.classify(QuestionStep.CALL_TIME, "x").isEmpty());
        assertEquals(callsWhenPaused, chatCalls.get());

        clock.advance(Duration.ofSeconds(61));
        assertTrue(classifier.classify(QuestionStep.CALL_TIME, "x").isPresent());
    }

    @Test
    void longCustomerMessagesAreTruncatedBeforeReachingTheModel() {
        classifier().classify(QuestionStep.CALL_TIME, "a".repeat(5000));
        String content = lastChatRequest.get().path("messages").get(1).path("content").asString();
        assertTrue(content.length() < 600);
    }

    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-10-11T00:00:00Z");

        void advance(Duration d) {
            now = now.plus(d);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public java.time.ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }
    }
}
