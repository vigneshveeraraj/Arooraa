package com.arooraa.aura.conversation.api;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubChatGenerationProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
import com.arooraa.aura.support.HttpTestClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The manual chat page, and the diagnostics switch that is deliberately separate from it: chat can
 * be on for a local session while internals stay off.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"aura.chat.enabled=true", "aura.chat.diagnostics-enabled=false"})
class LocalChatPageIT {

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

    @TestConfiguration
    static class StubProviders {
        @Bean
        @Primary
        EmbeddingProvider stubEmbeddingProvider() {
            return new StubEmbeddingProvider();
        }

        @Bean
        @Primary
        ChatGenerationProvider stubChatGenerationProvider() {
            return new StubChatGenerationProvider();
        }
    }

    @LocalServerPort
    private int port;
    private HttpTestClient http;

    @BeforeEach
    void setUp() {
        http = new HttpTestClient(port);
    }

    @Test
    void theManualChatPageIsServedWhenChatIsEnabled() {
        HttpTestClient.Response page = http.get("/aura-test");

        assertEquals(200, page.status());
        assertTrue(page.rawBody().contains("<title>Aura"));
        assertTrue(page.rawBody().contains("/api/v1/aura/conversations"), "the page talks to the real API");
        assertTrue(page.rawBody().contains("noindex"), "a test surface should never be indexable");
    }

    @Test
    void diagnosticsAreAbsentUnlessTheirOwnSwitchIsOn() {
        UUID conversation = UUID.fromString(
                http.post("/api/v1/aura/conversations", Map.of()).string("conversationId"));

        HttpTestClient.Response answer = http.post(
                "/api/v1/aura/conversations/" + conversation + "/messages", Map.of("message", "What is MESA?"));

        assertEquals(200, answer.status());
        assertFalse(answer.rawBody().contains("diagnostics"), "chat being on must not imply internals are on");
        assertFalse(answer.rawBody().contains("evidenceLevel"));
        assertTrue(answer.rawBody().contains("answer"));
    }
}
