package com.arooraa.aura.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.RestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The optional local-development CORS allowance (A4), with an origin configured.
 *
 * <p>Its default — nothing configured, no CORS at all — is asserted separately in
 * {@code ChatSurfaceDisabledByDefaultIT}, alongside the rest of the closed-by-default posture.
 * That split is deliberate: the default is the property that matters for a deployment, so it is
 * checked in the test that exists to describe what a deployment gets.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "aura.chat.enabled=true",
        "aura.cors.allowed-origins=http://localhost:3000"
})
class AuraCorsIT {

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

    @Autowired
    private ApplicationContext context;

    private HttpHeaders preflight(String origin, String path) {
        return RestClient.create()
                .options()
                .uri("http://localhost:" + port + path)
                .header(HttpHeaders.ORIGIN, origin)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                .exchange((request, response) -> response.getHeaders(), false);
    }

    @Test
    void theConfiguredOriginIsAllowedToCallTheChatApi() {
        HttpHeaders headers = preflight("http://localhost:3000", "/api/v1/aura/conversations");

        assertEquals("http://localhost:3000", headers.getFirst("Access-Control-Allow-Origin"));
        assertTrue(String.valueOf(headers.getFirst("Access-Control-Allow-Methods")).contains("POST"));
    }

    @Test
    void anyOtherOriginIsStillRefused() {
        // The list is matched exactly — there is no wildcard branch to fall through to.
        HttpHeaders headers = preflight("https://not-arooraa.example.com", "/api/v1/aura/conversations");

        assertNull(headers.getFirst("Access-Control-Allow-Origin"));
    }

    @Test
    void theAllowanceCoversTheChatApiAndNothingElse() {
        assertNull(preflight("http://localhost:3000", "/actuator/health").getFirst("Access-Control-Allow-Origin"));
        assertNull(preflight("http://localhost:3000", "/aura-test").getFirst("Access-Control-Allow-Origin"));
    }

    @Test
    void credentialsAreNeverAllowed() {
        // Aura has no cookies and no session; allowing credentials would only widen what a
        // cross-origin page could do with someone's browser.
        HttpHeaders headers = preflight("http://localhost:3000", "/api/v1/aura/conversations");

        assertNull(headers.getFirst("Access-Control-Allow-Credentials"));
    }

    @Test
    void theAllowanceIsWiredThroughTheBeanSpringSecurityActuallyLooksFor() {
        // Spring Security resolves this by name. A correctly built source under any other bean name
        // is silently ignored, and the only symptom is missing headers — so the name is asserted.
        assertTrue(context.containsBean("corsConfigurationSource"));
    }
}
