package com.arooraa.aura.protection;

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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * A8's abuse controls, through the real filter chain.
 *
 * <p>The limits here are tiny — two or three of each — so the tests are about the behaviour rather
 * than about generating traffic. Every other integration test in this repository switches the
 * limiter off and says why; this is the one that leaves it on.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "aura.chat.enabled=true",
        "aura.protection.enabled=true",
        // Turned on so each test can arrive as its own caller. The limiter is one bean for the
        // whole context, so without distinct identities these tests would share buckets and
        // depend on the order they ran in — and this exercises the proxy-header path besides.
        "aura.protection.trust-proxy-headers=true",
        "aura.protection.conversations.per-minute=2",
        "aura.protection.conversations.burst=2",
        "aura.protection.messages.per-minute=3",
        "aura.protection.messages.burst=3",
        "aura.protection.other.per-minute=60",
        "aura.protection.other.burst=30"
})
class AuraProtectionIT {

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

    static final StubChatGenerationProvider CHAT = new StubChatGenerationProvider();

    @TestConfiguration
    static class Stubs {
        @Bean
        @Primary
        EmbeddingProvider stubEmbeddingProvider() {
            return new StubEmbeddingProvider();
        }

        @Bean
        @Primary
        ChatGenerationProvider stubChatGenerationProvider() {
            return CHAT;
        }
    }

    @LocalServerPort
    private int port;
    private HttpTestClient http;

    @BeforeEach
    void setUp() {
        http = new HttpTestClient(port);
        CHAT.reset();
    }

    private HttpTestClient.Response open(String caller) {
        return http.postAs("/api/v1/aura/conversations", Map.of(), caller);
    }

    private HttpTestClient.Response say(String caller, UUID conversation, String message) {
        CHAT.reply("Happy to help.");
        return http.postAs("/api/v1/aura/conversations/" + conversation + "/messages",
                Map.of("message", message), caller);
    }

    @Test
    void refusesACallerWhoOpensConversationsFasterThanAnyoneCould() {
        // Two through the burst, and the third refused. The allowance is per caller and per
        // surface, so this test's own traffic is the only thing filling this bucket.
        assertEquals(201, open("198.51.100.1").status());
        assertEquals(201, open("198.51.100.1").status());

        HttpTestClient.Response refused = open("198.51.100.1");

        assertEquals(429, refused.status());
        assertEquals("TOO_MANY_REQUESTS", refused.string("code"));
    }

    @Test
    void tellsARefusedCallerWhenToComeBack() {
        for (int request = 0; request < 3; request++) open("198.51.100.2");

        HttpTestClient.Response refused = open("198.51.100.2");

        assertEquals(429, refused.status());
        // A client that is told nothing retries immediately, which is how a limiter turns one
        // impatient browser into a loop.
        assertNotNull(refused.header("Retry-After"));
        assertTrue(Integer.parseInt(refused.header("Retry-After")) >= 1);
    }

    @Test
    void saysSomethingAuraWouldSayRatherThanSomethingAServerWouldSay() {
        for (int request = 0; request < 3; request++) open("198.51.100.3");
        HttpTestClient.Response refused = open("198.51.100.3");

        String message = refused.string("message");
        assertNotNull(message);
        assertFalse(message.toLowerCase().contains("rate"), message);
        assertFalse(message.toLowerCase().contains("limit"), message);
        assertFalse(message.contains("429"), message);
        // And no numbers to calibrate the next attempt against: an abuse control that publishes
        // its own thresholds is a tuning guide for whoever tripped it.
        assertFalse(refused.rawBody().matches(".*\\b(per|minute|burst|quota)\\b.*"), refused.rawBody());
    }

    @Test
    void keepsOneSurfacesAllowanceOutOfAnothers() {
        // The failure this prevents is a visitor mid-conversation losing the ability to say
        // anything because something else spent the allowance.
        UUID conversation = UUID.fromString(open("198.51.100.4").string("conversationId"));
        open("198.51.100.4");
        assertEquals(429, open("198.51.100.4").status(), "the conversations bucket should now be empty");

        assertEquals(200, say("198.51.100.4", conversation, "What is AROORAA?").status());
    }

    @Test
    void neverReachesTheProviderForARefusedRequest() {
        // The whole point of doing this in a filter: a refusal that happens after the work is a
        // refusal that has already paid for what it is refusing.
        UUID conversation = UUID.fromString(open("198.51.100.5").string("conversationId"));
        for (int request = 0; request < 3; request++) say("198.51.100.5", conversation, "What is AROORAA?");
        CHAT.reset();

        HttpTestClient.Response refused = say("198.51.100.5", conversation, "And what is MESA?");

        assertEquals(429, refused.status());
        assertNull(CHAT.lastRequest(), "a refused request must not cost a generation");
    }
}
