package com.arooraa.leads.contact.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Full-stack tests against a real PostgreSQL instance — no mocks. Mirrors ProjectEnquiryIT/JobApplicationIT. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class ContactMessageIT {

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
        registry.add("arooraa.rate-limit.max-requests", () -> 100);
        registry.add("arooraa.rate-limit.window-minutes", () -> 10);
        registry.add("arooraa.contact.rate-limit.max-requests", () -> 100);
        registry.add("arooraa.contact.rate-limit.window-minutes", () -> 10);
        registry.add("arooraa.contact-notifications.enabled", () -> false);
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private ResponseEntity<Map> post(Map<String, Object> body, String syntheticClientIp, String idempotencyKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Forwarded-For", syntheticClientIp);
        if (idempotencyKey != null) {
            headers.set("Idempotency-Key", idempotencyKey);
        }
        return restTemplate.exchange("http://localhost:" + port + "/api/v1/contact/messages",
                HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
    }

    private static Map<String, Object> validBody(String email) {
        return Map.of(
                "name", "Arun Kumar",
                "email", email,
                "reason", "PARTNERSHIP",
                "message", "We'd like to explore a potential partnership with AROORAA.");
    }

    @Test
    void submitPersistsRowWithGeneratedReferenceAndHashedIpNoRawIp() {
        ResponseEntity<Map> response = post(validBody("contact-persist@example.com"), "10.40.10.1", null);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("NEW", response.getBody().get("status"));
        String reference = (String) response.getBody().get("contactReference");
        assertTrue(reference.matches("^CNT-\\d{4}-\\d{6}$"), "unexpected reference format: " + reference);
        assertFalse(response.getBody().containsKey("id"));

        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select id, status, ip_hash, reason from contact_messages where contact_reference = ?", reference);
        assertEquals("NEW", row.get("status"));
        assertEquals("PARTNERSHIP", row.get("reason"));
        String ipHash = (String) row.get("ip_hash");
        assertTrue(ipHash.matches("^[0-9a-f]{64}$"));
        assertFalse(ipHash.contains("10.40.10.1"));
    }

    @Test
    void productQuestionPersistsTheOptionalProductField() {
        Map<String, Object> body = Map.of(
                "name", "Priya Sharma",
                "email", "product-question@example.com",
                "reason", "PRODUCT_QUESTION",
                "product", "MESA",
                "message", "I have a question about MESA's pricing for a small restaurant chain.");
        ResponseEntity<Map> response = post(body, "10.40.10.2", null);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        String reference = (String) response.getBody().get("contactReference");
        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select product from contact_messages where contact_reference = ?", reference);
        assertEquals("MESA", row.get("product"));
    }

    @Test
    void generalReasonNeverRequiresAProduct() {
        Map<String, Object> body = Map.of(
                "name", "Arun Kumar",
                "email", "general-no-product@example.com",
                "reason", "GENERAL",
                "message", "Just a general question about AROORAA as a company.");
        ResponseEntity<Map> response = post(body, "10.40.10.3", null);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        String reference = (String) response.getBody().get("contactReference");
        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select product from contact_messages where contact_reference = ?", reference);
        assertNull(row.get("product"));
    }

    @Test
    void missingRequiredFieldsAreRejectedWithFieldSafe400() {
        Map<String, Object> body = Map.of("name", "", "email", "not-an-email", "message", "short");
        ResponseEntity<Map> response = post(body, "10.40.10.4", null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map fieldErrors = (Map) response.getBody().get("fieldErrors");
        assertTrue(fieldErrors.containsKey("name"));
        assertTrue(fieldErrors.containsKey("email"));
        assertTrue(fieldErrors.containsKey("reason"));
        assertTrue(fieldErrors.containsKey("message"));
    }

    @Test
    void invalidReasonValueIsRejectedWith400() {
        Map<String, Object> body = Map.of(
                "name", "Arun Kumar", "email", "invalid-reason@example.com",
                "reason", "START_A_PROJECT", "message", "This reason value should not exist.");
        ResponseEntity<Map> response = post(body, "10.40.10.5", null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from contact_messages where email = ?", Integer.class, "invalid-reason@example.com");
        assertEquals(0, count);
    }

    @Test
    void idempotentRetryReturnsSameReferenceWithNoDuplicateRow() {
        Map<String, Object> body = validBody("contact-retry@example.com");
        String key = "it-contact-idempotency-" + UUID.randomUUID();

        ResponseEntity<Map> first = post(body, "10.40.10.6", key);
        assertEquals(HttpStatus.CREATED, first.getStatusCode());
        String firstReference = (String) first.getBody().get("contactReference");

        ResponseEntity<Map> second = post(body, "10.40.10.6", key);
        assertEquals(HttpStatus.OK, second.getStatusCode());
        assertEquals(firstReference, second.getBody().get("contactReference"));

        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from contact_messages where email = ?", Integer.class, "contact-retry@example.com");
        assertEquals(1, count);
    }

    @Test
    void idempotencyKeyReusedWithADifferentPayloadIsAConflict() {
        String key = "it-contact-conflict-" + UUID.randomUUID();
        ResponseEntity<Map> first = post(validBody("contact-conflict@example.com"), "10.40.10.7", key);
        assertEquals(HttpStatus.CREATED, first.getStatusCode());

        Map<String, Object> changed = Map.of(
                "name", "Arun Kumar", "email", "contact-conflict@example.com",
                "reason", "PARTNERSHIP", "message", "A genuinely different message body from the first attempt.");
        ResponseEntity<Map> second = post(changed, "10.40.10.7", key);

        assertEquals(HttpStatus.CONFLICT, second.getStatusCode());
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from contact_messages where email = ?", Integer.class, "contact-conflict@example.com");
        assertEquals(1, count);
    }

    @Test
    void createsExactlyTwoNotificationIntentsThatStayPendingWhenNotificationsAreDisabled() {
        ResponseEntity<Map> response = post(validBody("contact-outbox@example.com"), "10.40.10.8", null);
        String reference = (String) response.getBody().get("contactReference");
        UUID messageId = (UUID) jdbcTemplate.queryForObject(
                "select id from contact_messages where contact_reference = ?", UUID.class, reference);

        List<Map<String, Object>> outboxRows = jdbcTemplate.queryForList(
                "select notification_type, status from contact_message_notification_outbox where contact_message_id = ?", messageId);
        assertEquals(2, outboxRows.size());
        for (Map<String, Object> row : outboxRows) {
            assertEquals("PENDING", row.get("status"));
        }
    }

    @Test
    void contactMessagesNeverAppearInSalesRecruitmentOrDemoTables() {
        long projectEnquiriesBefore = countRows("project_enquiries");
        long demoRequestsBefore = countRows("demo_requests");
        long jobApplicationsBefore = countRows("job_applications");
        long talentSubscriptionsBefore = countRows("talent_subscriptions");

        post(validBody("no-cross-contamination@example.com"), "10.40.10.9", null);

        assertEquals(projectEnquiriesBefore, countRows("project_enquiries"));
        assertEquals(demoRequestsBefore, countRows("demo_requests"));
        assertEquals(jobApplicationsBefore, countRows("job_applications"));
        assertEquals(talentSubscriptionsBefore, countRows("talent_subscriptions"));
    }

    @Test
    void endpointRequiresNoAuthenticationWhileAdminEndpointsStayProtected() {
        ResponseEntity<Map> contactResponse = post(validBody("no-auth-contact@example.com"), "10.40.10.10", null);
        assertEquals(HttpStatus.CREATED, contactResponse.getStatusCode());

        ResponseEntity<String> adminResponse = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/v1/admin/dashboard", String.class);
        assertTrue(adminResponse.getStatusCode().is4xxClientError());
    }

    private long countRows(String table) {
        Long count = jdbcTemplate.queryForObject("select count(*) from " + table, Long.class);
        return count == null ? 0 : count;
    }
}
