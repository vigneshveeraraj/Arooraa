package com.arooraa.aura.voice.api;

import com.arooraa.aura.provider.SpeechSynthesisProvider;
import com.arooraa.aura.provider.SpeechTranscriptionProvider;
import com.arooraa.aura.provider.disabled.DisabledSpeechSynthesisProvider;
import com.arooraa.aura.provider.disabled.DisabledSpeechTranscriptionProvider;
import com.arooraa.aura.support.HttpTestClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The default posture for voice, asserted rather than assumed — and asserted with chat deliberately
 * <em>on</em>, so the only thing being measured is the voice switch.
 *
 * <p>404 rather than 401 or 403, for the same reason the chat surface makes that distinction: the
 * controller is conditional, so with voice off there is no endpoint at all. A microphone route that
 * exists and refuses is not the same guarantee as one that is not there, and this is the property
 * that keeps an unreviewed audio-upload surface off any deployment that has not asked for it.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "aura.chat.enabled=true"
})
class VoiceSurfaceDisabledByDefaultIT {

    @Container
    static PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("pgvector/pgvector:pg16")
            .withStartupTimeout(java.time.Duration.ofMinutes(5))
            .withDatabaseName("arooraa_aura")
            .withUsername("arooraa_aura_app")
            .withPassword("integration-test-password");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @LocalServerPort
    private int port;
    private HttpTestClient http;

    @Autowired
    private SpeechTranscriptionProvider transcriptionProvider;

    @Autowired
    private SpeechSynthesisProvider synthesisProvider;

    @Autowired
    private ApplicationContext context;

    @BeforeEach
    void setUp() {
        http = new HttpTestClient(port);
    }

    @Test
    void theVoiceApiDoesNotExistWithoutBeingExplicitlyEnabled() {
        assertEquals(404, http.get("/api/v1/aura/voice/capabilities").status());
        assertEquals(404, http.postAudio("/api/v1/aura/voice/transcriptions",
                new byte[50_000], "audio/webm", "speech.webm", 3_000).status());
        assertEquals(404, http.post("/api/v1/aura/voice/speech",
                Map.of("conversationId", UUID.randomUUID().toString())).status());
    }

    @Test
    void chatStillWorksPerfectlyWellWithoutVoice() {
        // Voice is an addition, not a dependency. Turning it off must cost the text conversation
        // nothing at all.
        assertEquals(201, http.post("/api/v1/aura/conversations", Map.of()).status());
    }

    @Test
    void bothVoiceProvidersAreTheDisabledProductionSafeDefault() {
        assertInstanceOf(DisabledSpeechTranscriptionProvider.class, transcriptionProvider);
        assertInstanceOf(DisabledSpeechSynthesisProvider.class, synthesisProvider);
    }

    @Test
    void theVoiceControllerIsNotEvenRegistered() {
        assertTrue(context.getBeanNamesForType(AuraVoiceController.class).length == 0,
                "the voice controller must not exist without aura.voice.enabled=true");
    }

    @Test
    void theServiceIsStillHealthy() {
        HttpTestClient.Response health = http.get("/actuator/health");
        assertEquals(200, health.status());
        assertTrue(health.rawBody().contains("UP"));
    }
}
