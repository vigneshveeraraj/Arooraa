package com.arooraa.leads.capture.integration;

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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * POST /api/v1/lead-captures and the simulator-driven conversation against a real PostgreSQL, so
 * the V11 migration, the entity mappings and the unique indexes are all exercised. No mocks.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class LeadCaptureIT {

    private static final String SIMULATOR_TOKEN = "integration-simulator-token-0123456789";
    private static final String CONSENT = "I agree that AROORAA may contact me on this number about this enquiry.";

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
        registry.add("arooraa.lead-capture.rate-limit.max-requests", () -> 3);
        registry.add("arooraa.lead-capture.rate-limit.window-minutes", () -> 10);
        registry.add("arooraa.lead-conversation.simulator.enabled", () -> true);
        registry.add("arooraa.lead-conversation.simulator.token", () -> SIMULATOR_TOKEN);
        registry.add("arooraa.lead-assistant.model.provider", () -> "none");
        registry.add("arooraa.contact-notifications.enabled", () -> false);
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private ResponseEntity<Map> post(Map<String, Object> body, String clientIp, String idempotencyKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Forwarded-For", clientIp);
        if (idempotencyKey != null) {
            headers.set("Idempotency-Key", idempotencyKey);
        }
        return restTemplate.exchange("http://localhost:" + port + "/api/v1/lead-captures",
                HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
    }

    private ResponseEntity<Map> simulate(String phone, String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Simulator-Token", SIMULATOR_TOKEN);
        return restTemplate.exchange("http://localhost:" + port + "/api/v1/lead-conversations/simulator/messages",
                HttpMethod.POST, new HttpEntity<>(Map.of("phone", phone, "text", text), headers), Map.class);
    }

    private static Map<String, Object> validBody(String phone, String requirement) {
        Map<String, Object> body = new HashMap<>();
        body.put("requirement", requirement);
        body.put("phone", phone);
        body.put("countryCode", "IN");
        body.put("consent", true);
        body.put("consentText", CONSENT);
        body.put("sourceLocale", "ta");
        body.put("source", "WEBSITE");
        body.put("sourcePage", "/ta/grow-your-business");
        body.put("utmCampaign", "tn-growth");
        body.put("website", "");
        return body;
    }

    @Test
    void persistsTheLeadWithRecordedConsentAndReturnsOnlyAnOpaqueReference() {
        ResponseEntity<Map> response = post(validBody("98400 11111", "WEBSITE"), "10.50.0.1", null);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(1, response.getBody().size(), "only the reference is returned");
        String reference = (String) response.getBody().get("leadReference");
        assertTrue(reference.matches("^LC-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$"), reference);

        Map<String, Object> row = jdbcTemplate.queryForMap("select * from lead_captures where lead_reference = ?", reference);
        assertEquals("+919840011111", row.get("phone"));
        assertEquals("WEBSITE", row.get("requirement"));
        assertEquals(true, row.get("consent_given"));
        assertEquals(CONSENT, row.get("consent_text"));
        assertEquals("WEB_FORM", row.get("consent_source"));
        assertTrue(row.get("consent_at") != null);
        assertEquals("ta", row.get("source_locale"));
        assertNull(row.get("preferred_language"));
        assertEquals("NEW", row.get("status"));
        assertEquals("tn-growth", row.get("utm_campaign"));
        assertTrue(((String) row.get("ip_hash")).matches("^[0-9a-f]{64}$"));
    }

    @Test
    void consentFalseIsRejectedAndNothingIsStored() {
        Map<String, Object> body = validBody("+919840022222", "WEBSITE");
        body.put("consent", false);

        assertEquals(HttpStatus.BAD_REQUEST, post(body, "10.50.0.2", null).getStatusCode());
        assertEquals(0, count("+919840022222"));
    }

    @Test
    void idempotentRetryReturnsTheSameReferenceWithNoDuplicateRowAndADifferentBodyConflicts() {
        String key = "it-lead-" + UUID.randomUUID();

        ResponseEntity<Map> first = post(validBody("+919840033333", "AI_AUTOMATION"), "10.50.0.3", key);
        ResponseEntity<Map> retry = post(validBody("9840033333", "AI_AUTOMATION"), "10.50.0.3", key);
        ResponseEntity<Map> changed = post(validBody("+919840033333", "WEBSITE"), "10.50.0.3", key);

        assertEquals(HttpStatus.CREATED, first.getStatusCode());
        assertEquals(HttpStatus.OK, retry.getStatusCode());
        assertEquals(first.getBody().get("leadReference"), retry.getBody().get("leadReference"));
        assertEquals(HttpStatus.CONFLICT, changed.getStatusCode());
        assertEquals(1, count("+919840033333"));
    }

    @Test
    void rateLimitIsPerClientAndAnswers429() {
        for (int i = 0; i < 3; i++) {
            assertEquals(HttpStatus.CREATED, post(validBody("+91984004444" + i, "WEBSITE"), "10.50.0.4", null).getStatusCode());
        }
        ResponseEntity<Map> limited = post(validBody("+919840044449", "WEBSITE"), "10.50.0.4", null);
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, limited.getStatusCode());
        assertEquals(0, count("+919840044449"));

        assertEquals(HttpStatus.CREATED, post(validBody("+919840044448", "WEBSITE"), "10.50.0.5", null).getStatusCode());
    }

    @Test
    void theConversationContinuesTheSavedLeadInTheCustomersChosenLanguage() {
        String reference = (String) post(validBody("+919840055555", "WEBSITE"), "10.50.0.6", null).getBody().get("leadReference");

        ResponseEntity<Map> welcome = simulate("+919840055555", "Hi AROORAA, I need help with Website. Ref " + reference);
        assertEquals(reference, welcome.getBody().get("leadReference"));
        assertTrue(((List<String>) welcome.getBody().get("replies")).getFirst().startsWith("AROORAA-க்கு வரவேற்கிறோம்"));

        simulate("+919840055555", "1");
        simulate("+919840055555", "Textile shop in Erode");
        ResponseEntity<Map> close = simulate("+919840055555", "evening");
        assertEquals(List.of("Thank you! Our team will call you at that time to understand your needs."),
                close.getBody().get("replies"));

        Map<String, Object> lead = jdbcTemplate.queryForMap("select * from lead_captures where lead_reference = ?", reference);
        assertEquals("en", lead.get("preferred_language"), "the customer's choice overrides the Tamil page");
        assertEquals("ta", lead.get("source_locale"));
        assertEquals("Textile shop in Erode", lead.get("business_type"));
        assertEquals("EVENING", lead.get("preferred_call_time"));
        assertEquals(1, count("+919840055555"));

        Map<String, Object> conversation = jdbcTemplate.queryForMap(
                "select * from lead_conversations where lead_capture_id = ?", lead.get("id"));
        assertEquals("COMPLETED", conversation.get("state"));
        assertFalse(((String) conversation.get("participant_hash")).contains("9840055555"));
        Integer messages = jdbcTemplate.queryForObject(
                "select count(*) from lead_conversation_messages where conversation_id = ?", Integer.class, conversation.get("id"));
        assertEquals(8, messages);
    }

    @Test
    void aStrangersMessageCreatesTheirOwnLeadWithChatConsent() {
        ResponseEntity<Map> response = simulate("+919840066666", "vanakkam");
        String reference = (String) response.getBody().get("leadReference");

        Map<String, Object> lead = jdbcTemplate.queryForMap("select * from lead_captures where lead_reference = ?", reference);
        assertEquals("CUSTOMER_INITIATED_CHAT", lead.get("consent_source"));
        assertEquals("SIMULATOR", lead.get("source"));
        assertNull(lead.get("requirement"));
    }

    private int count(String phone) {
        return jdbcTemplate.queryForObject("select count(*) from lead_captures where phone = ?", Integer.class, phone);
    }
}
