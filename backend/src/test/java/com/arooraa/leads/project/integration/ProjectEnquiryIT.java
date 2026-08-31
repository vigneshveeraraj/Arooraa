package com.arooraa.leads.project.integration;

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

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Full-stack tests against a real PostgreSQL instance, mirroring the structure of
 * com.arooraa.leads.integration.DemoRequestIT. Each test uses its own synthetic
 * X-Forwarded-For identity so the independent project-enquiry rate limiter and
 * duplicate window don't leak state between test methods.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class ProjectEnquiryIT {

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
        // Deliberately different from the demo-request rate limit so independence is provable.
        registry.add("arooraa.rate-limit.max-requests", () -> 100);
        registry.add("arooraa.rate-limit.window-minutes", () -> 10);
        registry.add("arooraa.duplicate.window-minutes", () -> 5);
        registry.add("arooraa.project-enquiry.rate-limit.max-requests", () -> 3);
        registry.add("arooraa.project-enquiry.rate-limit.window-minutes", () -> 10);
        registry.add("arooraa.project-enquiry.duplicate.window-minutes", () -> 5);
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private ResponseEntity<Map> post(String path, String syntheticClientIp, Map<String, Object> body) {
        return post(path, syntheticClientIp, body, null);
    }

    private ResponseEntity<Map> post(String path, String syntheticClientIp, Map<String, Object> body,
                                      String idempotencyKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Forwarded-For", syntheticClientIp);
        if (idempotencyKey != null) {
            headers.set("Idempotency-Key", idempotencyKey);
        }
        return restTemplate.exchange("http://localhost:" + port + path,
                HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
    }

    private ResponseEntity<Map> postEnquiry(String syntheticClientIp, Map<String, Object> body) {
        return post("/api/v1/project-enquiries", syntheticClientIp, body);
    }

    private ResponseEntity<Map> postEnquiry(String syntheticClientIp, Map<String, Object> body, String idempotencyKey) {
        return post("/api/v1/project-enquiries", syntheticClientIp, body, idempotencyKey);
    }

    private static Map<String, Object> validGuidedBody(String email, String phone) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("submissionVersion", "GUIDED");
        body.put("name", "Priya Nair");
        body.put("companyName", "Nair Foods");
        body.put("businessEmail", email);
        body.put("phone", phone);
        body.put("country", "India");
        body.put("countryCode", "IN");
        body.put("solutionModel", "NEW_PRODUCT");
        body.put("engagementModel", "DESIGN_BUILD");
        body.put("problemStatement", "We want to launch a new customer ordering app for our restaurant chain.");
        body.put("projectStage", "IDEA");
        body.put("productTypes", List.of("MOBILE_APPLICATION", "BACKEND_APIS"));
        body.put("guidedTimeline", "WITHIN_1_TO_3_MONTHS");
        body.put("guidedBudgetRange", "UNDER_5L");
        body.put("preferredContactMethod", "EMAIL");
        body.put("whatsappConsent", true);
        body.put("source", "WEBSITE");
        body.put("sourcePage", "/start-project");
        return body;
    }

    private static Map<String, Object> validBody(String email, String phone) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", "Arun Kumar");
        body.put("companyName", "ABC Logistics");
        body.put("businessEmail", email);
        body.put("phone", phone);
        body.put("country", "India");
        body.put("serviceType", "CUSTOM_SOFTWARE");
        body.put("projectType", "NEW_PRODUCT");
        body.put("description", "We need a logistics tracking platform for our operations across five cities.");
        body.put("existingSystem", false);
        body.put("budgetRange", "FROM_2L_TO_5L");
        body.put("timeline", "FROM_1_TO_3_MONTHS");
        body.put("preferredContactMethod", "PHONE");
        body.put("source", "WEBSITE");
        body.put("sourcePage", "/start-project");
        return body;
    }

    @Test
    void submitPersistsRowWithGeneratedEnquiryNumberAndHashedIpNoRawIp() {
        ResponseEntity<Map> response =
                postEnquiry("10.20.10.1", validBody("persist-test@example.com", "+919876500101"));

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("RECEIVED", response.getBody().get("status"));
        String enquiryNumber = (String) response.getBody().get("enquiryNumber");
        assertTrue(enquiryNumber.matches("^ARO-\\d{4}-\\d{6}$"), "unexpected enquiry number format: " + enquiryNumber);

        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select status, ip_hash, normalized_phone from project_enquiries where enquiry_number = ?",
                enquiryNumber);
        assertEquals("NEW", row.get("status"));
        assertEquals("+919876500101", row.get("normalized_phone"));
        String ipHash = (String) row.get("ip_hash");
        assertTrue(ipHash.matches("^[0-9a-f]{64}$"), "ip_hash must be a 64-char hex digest");
        assertFalse(ipHash.contains("10.20.10.1"), "raw IP must never appear in the stored hash");
    }

    @Test
    void duplicateSubmissionWithinWindowReturns200AndDoesNotCreateSecondRow() {
        String email = "duplicate-test@example.com";
        String phone = "+919876500102";
        String syntheticIp = "10.20.10.2";

        ResponseEntity<Map> first = postEnquiry(syntheticIp, validBody(email, phone));
        assertEquals(HttpStatus.CREATED, first.getStatusCode());
        String firstNumber = (String) first.getBody().get("enquiryNumber");

        ResponseEntity<Map> second = postEnquiry(syntheticIp, validBody(email, phone));
        assertEquals(HttpStatus.OK, second.getStatusCode());
        assertEquals("ALREADY_RECEIVED", second.getBody().get("status"));
        assertEquals(firstNumber, second.getBody().get("enquiryNumber"));

        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from project_enquiries where normalized_phone = ? and lower(business_email) = lower(?)",
                Integer.class, phone, email);
        assertEquals(1, count, "only one row should exist for the duplicate pair");
    }

    @Test
    void rateLimitBlocksRequestsBeyondConfiguredMaximum() {
        String syntheticIp = "10.20.10.3";

        ResponseEntity<Map> r1 = postEnquiry(syntheticIp, validBody("rl1@example.com", "+919876500111"));
        ResponseEntity<Map> r2 = postEnquiry(syntheticIp, validBody("rl2@example.com", "+919876500112"));
        ResponseEntity<Map> r3 = postEnquiry(syntheticIp, validBody("rl3@example.com", "+919876500113"));
        ResponseEntity<Map> r4 = postEnquiry(syntheticIp, validBody("rl4@example.com", "+919876500114"));

        assertEquals(HttpStatus.CREATED, r1.getStatusCode());
        assertEquals(HttpStatus.CREATED, r2.getStatusCode());
        assertEquals(HttpStatus.CREATED, r3.getStatusCode());
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, r4.getStatusCode());
        assertEquals("RATE_LIMITED", r4.getBody().get("code"));
    }

    @Test
    void projectEnquiryRateLimitDoesNotAffectDemoRequestRateLimit() {
        String syntheticIp = "10.20.10.4";

        // Exhaust the project-enquiry limit (3/window at this synthetic IP).
        postEnquiry(syntheticIp, validBody("iso1@example.com", "+919876500121"));
        postEnquiry(syntheticIp, validBody("iso2@example.com", "+919876500122"));
        postEnquiry(syntheticIp, validBody("iso3@example.com", "+919876500123"));
        ResponseEntity<Map> blocked = postEnquiry(syntheticIp, validBody("iso4@example.com", "+919876500124"));
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, blocked.getStatusCode());

        // The unrelated MESA demo-request endpoint, from the same synthetic IP, must be unaffected.
        Map<String, Object> demoBody = new LinkedHashMap<>();
        demoBody.put("contactName", "Priya Sharma");
        demoBody.put("restaurantName", "Spice Route Isolation Test");
        demoBody.put("whatsappNumber", "9876500125");
        demoBody.put("city", "Chennai");
        demoBody.put("outletCount", "ONE");
        demoBody.put("restaurantType", "CASUAL_DINING");
        demoBody.put("primaryChallenge", "BILLING_POS");

        ResponseEntity<Map> demoResponse = post("/api/v1/demo-requests", syntheticIp, demoBody);
        assertEquals(HttpStatus.CREATED, demoResponse.getStatusCode(),
                "demo-request rate limit state must be independent of the project-enquiry limiter");
    }

    @Test
    void concurrentSubmissionsReceiveUniqueEnquiryNumbers() throws Exception {
        int concurrency = 5;
        ExecutorService pool = Executors.newFixedThreadPool(concurrency);
        try {
            List<Callable<String>> tasks = new ArrayList<>();
            for (int i = 0; i < concurrency; i++) {
                int index = i;
                tasks.add(() -> {
                    ResponseEntity<Map> response = postEnquiry("10.20.10." + (50 + index),
                            validBody("concurrent" + index + "@example.com", "+9198765002" + (30 + index)));
                    assertEquals(HttpStatus.CREATED, response.getStatusCode());
                    return (String) response.getBody().get("enquiryNumber");
                });
            }
            List<Future<String>> futures = pool.invokeAll(tasks);
            List<String> numbers = new ArrayList<>();
            for (Future<String> future : futures) {
                numbers.add(future.get());
            }
            Set<String> distinct = numbers.stream().collect(Collectors.toSet());
            assertEquals(concurrency, distinct.size(), "expected all concurrently generated enquiry numbers to be unique: " + numbers);
        } finally {
            pool.shutdown();
        }
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
                "select column_name from information_schema.columns where table_name = 'project_enquiries'",
                String.class);

        for (String expected : List.of("id", "enquiry_number", "name", "business_email", "normalized_phone",
                "service_type", "project_type", "budget_range", "timeline", "status", "ip_hash",
                "created_at", "updated_at", "submission_version", "solution_model", "guided_timeline",
                "idempotency_key", "request_fingerprint", "whatsapp_consent")) {
            assertTrue(columns.contains(expected), "missing expected column: " + expected);
        }
    }

    @Test
    void guidedSubmissionPersistsGuidedFieldsWithNullLegacyFieldsAndProductTypes() {
        ResponseEntity<Map> response = postEnquiry("10.20.10.60",
                validGuidedBody("guided-persist@example.com", "+919876500201"));

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        String enquiryNumber = (String) response.getBody().get("enquiryNumber");

        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select submission_version, service_type, project_type, budget_range, timeline, "
                        + "solution_model, guided_timeline, whatsapp_consent, id "
                        + "from project_enquiries where enquiry_number = ?",
                enquiryNumber);
        assertEquals("GUIDED", row.get("submission_version"));
        assertEquals(null, row.get("service_type"));
        assertEquals(null, row.get("project_type"));
        assertEquals(null, row.get("budget_range"));
        assertEquals(null, row.get("timeline"));
        assertEquals("NEW_PRODUCT", row.get("solution_model"));
        assertEquals("WITHIN_1_TO_3_MONTHS", row.get("guided_timeline"));
        assertEquals(Boolean.TRUE, row.get("whatsapp_consent"));

        List<String> productTypes = jdbcTemplate.queryForList(
                "select product_type from project_enquiry_product_types where enquiry_id = ?",
                String.class, row.get("id"));
        assertEquals(Set.of("MOBILE_APPLICATION", "BACKEND_APIS"), Set.copyOf(productTypes));
    }

    @Test
    void legacySubmissionStillLeavesGuidedOnlyColumnsNull() {
        ResponseEntity<Map> response =
                postEnquiry("10.20.10.61", validBody("legacy-still-works@example.com", "+919876500202"));

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        String enquiryNumber = (String) response.getBody().get("enquiryNumber");

        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select submission_version, solution_model, guided_timeline, service_type "
                        + "from project_enquiries where enquiry_number = ?",
                enquiryNumber);
        assertEquals("LEGACY", row.get("submission_version"));
        assertEquals(null, row.get("solution_model"));
        assertEquals(null, row.get("guided_timeline"));
        assertEquals("CUSTOM_SOFTWARE", row.get("service_type"));
    }

    @Test
    void idempotencyKeyReplayWithSamePayloadReturns200AndDoesNotCreateASecondRow() {
        Map<String, Object> body = validGuidedBody("idempotent-replay@example.com", "+919876500203");

        ResponseEntity<Map> first = postEnquiry("10.20.10.62", body, "it-idempotency-key-1");
        assertEquals(HttpStatus.CREATED, first.getStatusCode());
        String firstNumber = (String) first.getBody().get("enquiryNumber");

        ResponseEntity<Map> second = postEnquiry("10.20.10.62", body, "it-idempotency-key-1");
        assertEquals(HttpStatus.OK, second.getStatusCode());
        assertEquals("ALREADY_RECEIVED", second.getBody().get("status"));
        assertEquals(firstNumber, second.getBody().get("enquiryNumber"));

        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from project_enquiries where idempotency_key = ?",
                Integer.class, "it-idempotency-key-1");
        assertEquals(1, count, "a replayed idempotency key must never create a second row");
    }

    @Test
    void idempotencyKeyReusedWithADifferentPayloadReturns409Conflict() {
        ResponseEntity<Map> first = postEnquiry("10.20.10.63",
                validGuidedBody("idempotent-conflict-a@example.com", "+919876500204"), "it-idempotency-key-2");
        assertEquals(HttpStatus.CREATED, first.getStatusCode());

        ResponseEntity<Map> second = postEnquiry("10.20.10.63",
                validGuidedBody("idempotent-conflict-b@example.com", "+919876500205"), "it-idempotency-key-2");
        assertEquals(HttpStatus.CONFLICT, second.getStatusCode());
        assertEquals("IDEMPOTENCY_CONFLICT", second.getBody().get("code"));

        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from project_enquiries where idempotency_key = ?",
                Integer.class, "it-idempotency-key-2");
        assertEquals(1, count, "a conflicting replay must never create a second row");
    }
}
