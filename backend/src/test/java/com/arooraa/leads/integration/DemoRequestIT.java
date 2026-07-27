package com.arooraa.leads.integration;

import com.arooraa.leads.domain.DemoRequest;
import com.arooraa.leads.repository.DemoRequestRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Full-stack tests against a real PostgreSQL instance. Each test uses its own synthetic
 * X-Forwarded-For identity (trusted only because this class configures the loopback address
 * as a trusted proxy) so the shared in-memory rate limiter and duplicate window don't leak
 * state between unrelated test methods regardless of execution order.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class DemoRequestIT {

    @Container
    static PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withStartupTimeout(java.time.Duration.ofMinutes(5))
            .withDatabaseName("arooraa_leads")
            .withUsername("arooraa_leads_app")
            .withPassword("integration-test-password");

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("arooraa.ip-hash-secret", () -> "integration-test-secret");
        registry.add("arooraa.trusted-proxies", () -> "127.0.0.1,0:0:0:0:0:0:0:1");
        registry.add("arooraa.rate-limit.max-requests", () -> 3);
        registry.add("arooraa.rate-limit.window-minutes", () -> 10);
        registry.add("arooraa.duplicate.window-minutes", () -> 5);
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private DemoRequestRepository repository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private ResponseEntity<Map> post(String syntheticClientIp, Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Forwarded-For", syntheticClientIp);
        return restTemplate.exchange(
                "http://localhost:" + port + "/api/v1/demo-requests",
                HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
    }

    private static Map<String, Object> validBody(String restaurantName, String phone) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("contactName", "Priya Sharma");
        body.put("restaurantName", restaurantName);
        body.put("whatsappNumber", phone);
        body.put("city", "Chennai");
        body.put("outletCount", "ONE");
        body.put("restaurantType", "CASUAL_DINING");
        body.put("primaryChallenge", "BILLING_POS");
        return body;
    }

    @Test
    void submitPersistsRowWithGeneratedIdAndHashedIpNoRawIp() {
        ResponseEntity<Map> response = post("10.10.10.1", validBody("Persist Test Kitchen", "9876500001"));

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        String requestId = (String) response.getBody().get("requestId");
        assertEquals("RECEIVED", response.getBody().get("status"));

        DemoRequest saved = repository.findById(UUID.fromString(requestId)).orElseThrow();
        assertEquals("NEW", saved.getStatus().name());
        assertEquals("PENDING", saved.getNotificationStatus().name());
        assertEquals("+919876500001", saved.getNormalizedWhatsappNumber());
        assertTrue(saved.getIpHash().matches("^[0-9a-f]{64}$"), "ip_hash must be a 64-char hex digest");
        assertFalse(saved.getIpHash().contains("10.10.10.1"), "raw IP must never appear in the stored hash");
    }

    @Test
    void duplicateSubmissionWithinWindowReturns200AndDoesNotCreateSecondRow() {
        String restaurantName = "Duplicate Test Kitchen";
        String phone = "9876500002";
        String syntheticIp = "10.10.10.2";

        ResponseEntity<Map> first = post(syntheticIp, validBody(restaurantName, phone));
        assertEquals(HttpStatus.CREATED, first.getStatusCode());
        String firstId = (String) first.getBody().get("requestId");

        ResponseEntity<Map> second = post(syntheticIp, validBody(restaurantName, phone));
        assertEquals(HttpStatus.OK, second.getStatusCode());
        assertEquals("ALREADY_RECEIVED", second.getBody().get("status"));
        assertEquals(firstId, second.getBody().get("requestId"));

        long matchingRows = repository.findRecentDuplicates("+919876500002", restaurantName,
                java.time.Instant.now().minus(java.time.Duration.ofMinutes(5))).size();
        assertEquals(1, matchingRows, "only one row should exist for the duplicate pair");
    }

    @Test
    void rateLimitBlocksRequestsBeyondConfiguredMaximum() {
        String syntheticIp = "10.10.10.3";

        ResponseEntity<Map> r1 = post(syntheticIp, validBody("Rate Limit Kitchen 1", "9876500011"));
        ResponseEntity<Map> r2 = post(syntheticIp, validBody("Rate Limit Kitchen 2", "9876500012"));
        ResponseEntity<Map> r3 = post(syntheticIp, validBody("Rate Limit Kitchen 3", "9876500013"));
        ResponseEntity<Map> r4 = post(syntheticIp, validBody("Rate Limit Kitchen 4", "9876500014"));

        assertEquals(HttpStatus.CREATED, r1.getStatusCode());
        assertEquals(HttpStatus.CREATED, r2.getStatusCode());
        assertEquals(HttpStatus.CREATED, r3.getStatusCode());
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, r4.getStatusCode());
        assertEquals("RATE_LIMITED", r4.getBody().get("code"));
    }

    @Test
    void healthEndpointReportsUp() {
        ResponseEntity<Map> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/actuator/health", Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("UP", response.getBody().get("status"));
    }

    @Test
    void flywayMigrationCreatedExpectedTableAndColumns() {
        List<String> columns = jdbcTemplate.queryForList(
                "select column_name from information_schema.columns where table_name = 'demo_requests'",
                String.class);

        for (String expected : List.of("id", "contact_name", "normalized_whatsapp_number", "ip_hash",
                "status", "notification_status", "created_at", "updated_at")) {
            assertTrue(columns.contains(expected), "missing expected column: " + expected);
        }
    }
}
