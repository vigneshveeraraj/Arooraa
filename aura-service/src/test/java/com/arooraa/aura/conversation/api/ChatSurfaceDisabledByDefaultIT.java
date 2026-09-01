package com.arooraa.aura.conversation.api;

import com.arooraa.aura.bootstrap.PublicKnowledgeBootstrap;
import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.disabled.DisabledChatGenerationProvider;
import com.arooraa.aura.support.HttpTestClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
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
 * The default posture, asserted rather than assumed: with no chat configuration the service starts
 * healthy and the chat surface simply does not exist.
 *
 * <p>Deliberately checks for 404 rather than 401/403. The controllers are conditional on
 * {@code aura.chat.enabled}, so when it is off there is no endpoint at all — which is a stronger
 * property than an endpoint that exists and refuses, and the one A3 relies on to keep an
 * unreviewed chat surface off the public internet.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ChatSurfaceDisabledByDefaultIT {

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
    private ChatGenerationProvider chatGenerationProvider;

    @Autowired
    private org.springframework.context.ApplicationContext context;

    @BeforeEach
    void setUp() {
        http = new HttpTestClient(port);
    }

    @Test
    void theChatApiDoesNotExistWithoutBeingExplicitlyEnabled() {
        assertEquals(404, http.post("/api/v1/aura/conversations", Map.of()).status());
        assertEquals(404, http.post("/api/v1/aura/conversations/" + UUID.randomUUID() + "/messages",
                Map.of("message", "Hello")).status());
    }

    @Test
    void theManualTestPageDoesNotExistWithoutBeingExplicitlyEnabled() {
        assertEquals(404, http.get("/aura-test").status());
    }

    @Test
    void theServiceStartsHealthyWithNoChatProviderConfigured() {
        assertInstanceOf(DisabledChatGenerationProvider.class, chatGenerationProvider);

        HttpTestClient.Response health = http.get("/actuator/health");
        assertEquals(200, health.status());
        assertTrue(health.rawBody().contains("UP"));
    }

    @Test
    void nothingElseIsReachableEither() {
        assertEquals(403, http.get("/actuator/env").status());
    }

    @Test
    void theKnowledgeBootstrapIsNotActiveEither() {
        // Loading knowledge is an operator action, so the runner that does it does not exist unless
        // asked for — and there is no HTTP route that could trigger one.
        assertTrue(context.getBeanNamesForType(PublicKnowledgeBootstrap.class).length == 0,
                "the bootstrap runner must not be registered without aura.bootstrap.public-knowledge=true");
    }
}
