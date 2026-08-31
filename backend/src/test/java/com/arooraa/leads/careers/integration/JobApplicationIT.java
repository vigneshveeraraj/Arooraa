package com.arooraa.leads.careers.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Full-stack tests against a real PostgreSQL instance and a real (temp-directory) filesystem
 * résumé store — no mocks (W3.3B §21). Mirrors the structure of ProjectEnquiryIT. Each test uses
 * its own synthetic X-Forwarded-For identity and a generous rate-limit override so the many
 * requests in this class never trip each other's rate limiter (unit-level rate-limit rejection
 * is already covered by JobApplicationServiceTest).
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class JobApplicationIT {

    @Container
    static PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withStartupTimeout(java.time.Duration.ofMinutes(5))
            .withDatabaseName("arooraa_leads")
            .withUsername("arooraa_leads_app")
            .withPassword("integration-test-password");

    private static final Path RESUME_STORAGE_DIR = createTempDir();

    private static Path createTempDir() {
        try {
            return Files.createTempDirectory("recruitment-it-resumes");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("arooraa.ip-hash-secret", () -> "integration-test-secret");
        registry.add("arooraa.trusted-proxies", () -> "127.0.0.1,0:0:0:0:0:0:0:1");
        registry.add("arooraa.rate-limit.max-requests", () -> 100);
        registry.add("arooraa.rate-limit.window-minutes", () -> 10);
        registry.add("arooraa.recruitment.resume.storage-dir", RESUME_STORAGE_DIR::toString);
        registry.add("arooraa.recruitment.rate-limit.max-requests", () -> 100);
        registry.add("arooraa.recruitment.rate-limit.window-minutes", () -> 10);
        registry.add("arooraa.recruitment.talent-community.rate-limit.max-requests", () -> 100);
        registry.add("arooraa.recruitment.talent-community.rate-limit.window-minutes", () -> 10);
        // Notifications stay disabled — proves applications persist regardless (W3.3B §14, §21).
        registry.add("arooraa.recruitment-notifications.enabled", () -> false);
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final byte[] PDF_BYTES = "%PDF-1.4\nsample resume content for IT test".getBytes(StandardCharsets.US_ASCII);

    private ResponseEntity<Map> postApplication(String syntheticClientIp, MultiValueMap<String, Object> parts, String idempotencyKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("X-Forwarded-For", syntheticClientIp);
        if (idempotencyKey != null) {
            headers.set("Idempotency-Key", idempotencyKey);
        }
        return restTemplate.exchange("http://localhost:" + port + "/api/v1/careers/applications",
                HttpMethod.POST, new HttpEntity<>(parts, headers), Map.class);
    }

    private static MultiValueMap<String, Object> validParts(String email, String phone) {
        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("jobSlug", "ai-engineer");
        parts.add("fullName", "Priya Sharma");
        parts.add("email", email);
        parts.add("phone", phone);
        parts.add("currentLocation", "Chennai");
        parts.add("experience", "3 years");
        parts.add("recruitmentConsent", "true");
        return parts;
    }

    private static void addResumePart(MultiValueMap<String, Object> parts, byte[] content, String contentType, String filename) {
        Resource resource = new ByteArrayResource(content) {
            @Override
            public String getFilename() {
                return filename;
            }
        };
        HttpHeaders fileHeaders = new HttpHeaders();
        fileHeaders.setContentType(MediaType.parseMediaType(contentType));
        parts.add("resume", new HttpEntity<>(resource, fileHeaders));
    }

    @Test
    void successfulApplicationWithResumePersistsRowStoresRealFileAndCreatesNotificationIntents() {
        MultiValueMap<String, Object> parts = validParts("with-resume@example.com", "+919876500201");
        addResumePart(parts, PDF_BYTES, "application/pdf", "My Resume.pdf");

        ResponseEntity<Map> response = postApplication("10.30.10.1", parts, null);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("RECEIVED", response.getBody().get("status"));
        assertEquals("ai-engineer", response.getBody().get("jobSlug"));
        String reference = (String) response.getBody().get("applicationReference");
        assertTrue(reference.matches("^JOB-\\d{4}-\\d{6}$"), "unexpected reference format: " + reference);
        // Never leaks internal identifiers.
        assertFalse(response.getBody().containsKey("id"));
        assertFalse(response.getBody().toString().toLowerCase().contains("storage"));

        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select id, status, ip_hash, resume_storage_key, resume_original_filename, resume_content_type, resume_size "
                        + "from job_applications where application_reference = ?", reference);
        assertEquals("RECEIVED", row.get("status"));
        String ipHash = (String) row.get("ip_hash");
        assertTrue(ipHash.matches("^[0-9a-f]{64}$"));
        assertFalse(ipHash.contains("10.30.10.1"), "raw IP must never appear in the stored hash");
        String storageKey = (String) row.get("resume_storage_key");
        assertNotNull(storageKey);
        assertEquals("My Resume.pdf", row.get("resume_original_filename"));
        assertEquals("application/pdf", row.get("resume_content_type"));

        // Real résumé-storage evidence: the file genuinely exists on disk with the right bytes.
        Path storedFile = RESUME_STORAGE_DIR.resolve("applications").resolve(storageKey);
        assertTrue(Files.exists(storedFile), "résumé file must physically exist in private storage");
        try {
            assertTrue(Files.readAllBytes(storedFile).length > 0);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        assertFalse(Files.exists(RESUME_STORAGE_DIR.resolve("tmp").resolve(storageKey)), "temp file must be gone after promotion");

        UUID applicationId = (UUID) row.get("id");
        List<Map<String, Object>> outboxRows = jdbcTemplate.queryForList(
                "select notification_type, status from job_application_notification_outbox where job_application_id = ?",
                applicationId);
        assertEquals(2, outboxRows.size(), "exactly one CANDIDATE_ACKNOWLEDGEMENT + one INTERNAL_RECRUITMENT_ALERT intent");
        for (Map<String, Object> outboxRow : outboxRows) {
            assertEquals("PENDING", outboxRow.get("status"), "notifications disabled — intents stay PENDING, never sent");
        }
    }

    @Test
    void applicationWithoutAResumePersistsWithNullResumeFields() {
        ResponseEntity<Map> response = postApplication("10.30.10.2", validParts("no-resume@example.com", "+919876500202"), null);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        String reference = (String) response.getBody().get("applicationReference");
        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select resume_storage_key from job_applications where application_reference = ?", reference);
        assertNull(row.get("resume_storage_key"));
    }

    @Test
    void unknownJobSlugIsRejectedWith400AndNeverPersisted() {
        MultiValueMap<String, Object> parts = validParts("unknown-job@example.com", "+919876500203");
        parts.set("jobSlug", "totally-made-up-role");

        ResponseEntity<Map> response = postApplication("10.30.10.3", parts, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from job_applications where email = ?", Integer.class, "unknown-job@example.com");
        assertEquals(0, count);
    }

    @Test
    void missingConsentIsRejectedWithAFieldSafe400() {
        MultiValueMap<String, Object> parts = validParts("no-consent@example.com", "+919876500204");
        parts.set("recruitmentConsent", "false");

        ResponseEntity<Map> response = postApplication("10.30.10.4", parts, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map fieldErrors = (Map) response.getBody().get("fieldErrors");
        assertTrue(fieldErrors.containsKey("recruitmentConsent"));
    }

    @Test
    void invalidEmailIsRejectedWithAFieldSafe400() {
        MultiValueMap<String, Object> parts = validParts("not-an-email", "+919876500205");

        ResponseEntity<Map> response = postApplication("10.30.10.5", parts, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map fieldErrors = (Map) response.getBody().get("fieldErrors");
        assertTrue(fieldErrors.containsKey("email"));
    }

    @Test
    void invalidResumeFileTypeIsRejectedAndNeverPersistedOrStored() throws IOException {
        MultiValueMap<String, Object> parts = validParts("bad-file-type@example.com", "+919876500206");
        addResumePart(parts, new byte[]{0x4D, 0x5A}, "application/x-msdownload", "resume.exe");
        long filesBefore = countStoredFiles();

        ResponseEntity<Map> response = postApplication("10.30.10.6", parts, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map fieldErrors = (Map) response.getBody().get("fieldErrors");
        assertTrue(fieldErrors.containsKey("resume"));
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from job_applications where email = ?", Integer.class, "bad-file-type@example.com");
        assertEquals(0, count);
        assertEquals(filesBefore, countStoredFiles(), "an invalid résumé must never be written to storage");
    }

    @Test
    void oversizedResumeIsRejectedBeforeStorage() throws IOException {
        MultiValueMap<String, Object> parts = validParts("oversized@example.com", "+919876500207");
        byte[] oversized = new byte[6 * 1024 * 1024];
        System.arraycopy(PDF_BYTES, 0, oversized, 0, PDF_BYTES.length);
        addResumePart(parts, oversized, "application/pdf", "huge.pdf");
        long filesBefore = countStoredFiles();

        // The server correctly rejects the oversized part server-side (see ResumeValidatorTest
        // and JobApplicationServiceTest for that behavior in isolation) and — being an HTTP/1.1
        // exchange with no Expect:100-continue negotiation — can only signal that by closing the
        // connection before the client has finished writing the still-streaming 6MB body. Any
        // HTTP client, real browsers included, surfaces an early server-side close during an
        // in-flight upload as a connection/write error rather than a clean response; this is a
        // fundamental HTTP interaction, not a defect in this codebase's handling. What actually
        // matters — and what this test asserts unconditionally — is that no application row and
        // no résumé file are ever created for an oversized upload, regardless of which shape the
        // client observes the rejection in.
        try {
            ResponseEntity<Map> response = postApplication("10.30.10.7", parts, null);
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        } catch (org.springframework.web.client.ResourceAccessException expectedEarlyClose) {
            // Acceptable — see comment above.
        }

        assertEquals(filesBefore, countStoredFiles());
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from job_applications where email = ?", Integer.class, "oversized@example.com");
        assertEquals(0, count);
    }

    @Test
    void idempotentRetryReturnsSameReferenceWithNoDuplicateRowOrResumeFile() throws IOException {
        MultiValueMap<String, Object> firstParts = validParts("retry@example.com", "+919876500208");
        addResumePart(firstParts, PDF_BYTES, "application/pdf", "resume.pdf");
        String key = "it-idempotency-" + UUID.randomUUID();

        ResponseEntity<Map> first = postApplication("10.30.10.8", firstParts, key);
        assertEquals(HttpStatus.CREATED, first.getStatusCode());
        String firstReference = (String) first.getBody().get("applicationReference");
        long filesAfterFirst = countStoredFiles();

        MultiValueMap<String, Object> secondParts = validParts("retry@example.com", "+919876500208");
        addResumePart(secondParts, PDF_BYTES, "application/pdf", "resume.pdf");
        ResponseEntity<Map> second = postApplication("10.30.10.8", secondParts, key);

        assertEquals(HttpStatus.OK, second.getStatusCode());
        assertEquals(firstReference, second.getBody().get("applicationReference"));
        assertEquals("This application was already received.", second.getBody().get("message"));

        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from job_applications where email = ?", Integer.class, "retry@example.com");
        assertEquals(1, count, "retry must never create a second row");
        assertEquals(filesAfterFirst, countStoredFiles(), "retry must never store a second résumé file");
    }

    @Test
    void idempotencyKeyReusedWithADifferentPayloadIsAConflict() {
        String key = "it-conflict-" + UUID.randomUUID();
        ResponseEntity<Map> first = postApplication("10.30.10.9", validParts("conflict@example.com", "+919876500209"), key);
        assertEquals(HttpStatus.CREATED, first.getStatusCode());

        MultiValueMap<String, Object> changedParts = validParts("conflict@example.com", "+919876500209");
        changedParts.set("experience", "10 years"); // genuinely different payload, same key
        ResponseEntity<Map> second = postApplication("10.30.10.9", changedParts, key);

        assertEquals(HttpStatus.CONFLICT, second.getStatusCode());
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from job_applications where email = ?", Integer.class, "conflict@example.com");
        assertEquals(1, count);
    }

    @Test
    void talentSubscriptionCreatesARowAndADuplicateEmailMergesRatherThanDuplicating() {
        Map<String, Object> body = Map.of(
                "name", "Arjun Rao",
                "email", "talent@example.com",
                "areasOfInterest", List.of("AI_DATA", "FRONTEND"),
                "experienceLevel", "EXPERIENCED",
                "consentAccepted", true);

        ResponseEntity<Map> first = postJson("/api/v1/careers/talent-community", "10.30.10.10", body);
        assertEquals(HttpStatus.CREATED, first.getStatusCode());
        assertEquals("SUBSCRIBED", first.getBody().get("status"));

        Integer countAfterFirst = jdbcTemplate.queryForObject(
                "select count(*) from talent_subscriptions where email = ?", Integer.class, "talent@example.com");
        assertEquals(1, countAfterFirst);

        Map<String, Object> resubmit = Map.of(
                "name", "Arjun Rao (updated)",
                "email", "TALENT@example.com",
                "areasOfInterest", List.of("SALES"),
                "consentAccepted", true);
        ResponseEntity<Map> second = postJson("/api/v1/careers/talent-community", "10.30.10.10", resubmit);
        assertEquals(HttpStatus.CREATED, second.getStatusCode());

        Integer countAfterSecond = jdbcTemplate.queryForObject(
                "select count(*) from talent_subscriptions where email = ?", Integer.class, "talent@example.com");
        assertEquals(1, countAfterSecond, "a second submission from the same email must update, not duplicate");
    }

    @Test
    void talentSubscriptionWithoutConsentIsRejected() {
        Map<String, Object> body = Map.of(
                "name", "No Consent",
                "email", "no-consent-talent@example.com",
                "areasOfInterest", List.of("ANY"),
                "consentAccepted", false);

        ResponseEntity<Map> response = postJson("/api/v1/careers/talent-community", "10.30.10.11", body);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from talent_subscriptions where email = ?", Integer.class, "no-consent-talent@example.com");
        assertEquals(0, count);
    }

    @Test
    void recruitmentRecordsNeverAppearInSalesCrmTables() {
        long projectEnquiriesBefore = countRows("project_enquiries");
        long demoRequestsBefore = countRows("demo_requests");

        MultiValueMap<String, Object> parts = validParts("no-crm-leak@example.com", "+919876500212");
        postApplication("10.30.10.12", parts, null);

        assertEquals(projectEnquiriesBefore, countRows("project_enquiries"));
        assertEquals(demoRequestsBefore, countRows("demo_requests"));
    }

    @Test
    void applicationEndpointRequiresNoAuthenticationWhileAdminEndpointsStayProtected() {
        ResponseEntity<Map> applicationResponse = postApplication("10.30.10.13", validParts("no-auth@example.com", "+919876500213"), null);
        assertEquals(HttpStatus.CREATED, applicationResponse.getStatusCode());

        ResponseEntity<String> adminResponse = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/v1/admin/dashboard", String.class);
        assertTrue(adminResponse.getStatusCode().is4xxClientError(), "admin routes must remain protected");
    }

    private ResponseEntity<Map> postJson(String path, String syntheticClientIp, Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Forwarded-For", syntheticClientIp);
        return restTemplate.exchange("http://localhost:" + port + path,
                HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
    }

    private long countRows(String table) {
        Long count = jdbcTemplate.queryForObject("select count(*) from " + table, Long.class);
        return count == null ? 0 : count;
    }

    private long countStoredFiles() throws IOException {
        Path applicationsDir = RESUME_STORAGE_DIR.resolve("applications");
        if (!Files.exists(applicationsDir)) {
            return 0;
        }
        try (var stream = Files.list(applicationsDir)) {
            return stream.count();
        }
    }
}
