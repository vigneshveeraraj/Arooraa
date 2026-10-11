package com.arooraa.leads.admin.integration;

import com.arooraa.leads.domain.DemoRequest;
import com.arooraa.leads.domain.OutletCount;
import com.arooraa.leads.domain.PrimaryChallenge;
import com.arooraa.leads.domain.RestaurantType;
import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.Timeline;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.repository.DemoRequestRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Full-stack admin tests against real PostgreSQL, exercising the actual Spring Security
 * session cookie + CSRF double-submit flow (not mocked), mirroring DemoRequestIT /
 * ProjectEnquiryIT's style. Test data is seeded directly via the domain repositories —
 * only the public-API-level behaviour of the submission endpoints is re-verified here
 * (they must remain public); their own validation/rate-limit/duplicate behaviour is
 * already covered by DemoRequestIT / ProjectEnquiryIT.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class AdminIT {

    private static final String BOOTSTRAP_EMAIL = "owner@arooraa.test";
    private static final String BOOTSTRAP_PASSWORD = "correct-horse-battery-staple";

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
        registry.add("arooraa.duplicate.window-minutes", () -> 5);
        registry.add("arooraa.project-enquiry.rate-limit.max-requests", () -> 100);
        registry.add("arooraa.project-enquiry.rate-limit.window-minutes", () -> 10);
        registry.add("arooraa.project-enquiry.duplicate.window-minutes", () -> 5);
        registry.add("arooraa.admin.bootstrap-email", () -> BOOTSTRAP_EMAIL);
        registry.add("arooraa.admin.bootstrap-password", () -> BOOTSTRAP_PASSWORD);
        registry.add("arooraa.admin.login-rate-limit.max-attempts", () -> 3);
        registry.add("arooraa.admin.login-rate-limit.window-minutes", () -> 15);
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DemoRequestRepository demoRequestRepository;

    @Autowired
    private ProjectEnquiryRepository projectEnquiryRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    /**
     * TestRestTemplate does not jar cookies across calls by default, so session
     * (JSESSIONID) and CSRF (XSRF-TOKEN) cookies are tracked here explicitly and resent
     * on every request — exactly what a browser or the real frontend does automatically.
     */
    private final class CookieJar {
        private final Map<String, String> cookies = new LinkedHashMap<>();

        void update(ResponseEntity<?> response) {
            List<String> setCookies = response.getHeaders().get(HttpHeaders.SET_COOKIE);
            if (setCookies == null) {
                return;
            }
            for (String raw : setCookies) {
                String pair = raw.split(";", 2)[0];
                int eq = pair.indexOf('=');
                if (eq > 0) {
                    cookies.put(pair.substring(0, eq), pair.substring(eq + 1));
                }
            }
        }

        String get(String name) {
            return cookies.get(name);
        }

        HttpHeaders headers() {
            return headers(true);
        }

        /** With {@code includeCsrfHeader=false}, omits X-XSRF-TOKEN while still sending the
         * session (and, if present, XSRF-TOKEN) cookies — used to prove CSRF is enforced even
         * for an otherwise-authenticated request. */
        HttpHeaders headers(boolean includeCsrfHeader) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (!cookies.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                cookies.forEach((k, v) -> {
                    if (!sb.isEmpty()) {
                        sb.append("; ");
                    }
                    sb.append(k).append('=').append(v);
                });
                headers.set(HttpHeaders.COOKIE, sb.toString());
            }
            if (includeCsrfHeader) {
                String csrf = cookies.get("XSRF-TOKEN");
                if (csrf != null) {
                    headers.set("X-XSRF-TOKEN", csrf);
                }
            }
            return headers;
        }
    }

    private <T> ResponseEntity<T> call(CookieJar jar, HttpMethod method, String path, Object body, Class<T> type) {
        return call(jar, method, path, body, type, jar.headers());
    }

    private <T> ResponseEntity<T> call(CookieJar jar, HttpMethod method, String path, Object body, Class<T> type, HttpHeaders headers) {
        ResponseEntity<T> response = restTemplate.exchange(baseUrl() + path, method, new HttpEntity<>(body, headers), type);
        jar.update(response);
        return response;
    }

    private ResponseEntity<Map> login(CookieJar jar, String email, String password) {
        return call(jar, HttpMethod.POST, "/api/v1/admin/auth/login", Map.of("email", email, "password", password), Map.class);
    }

    /**
     * Creates a brand-new admin with a unique email and logs in as them. The login
     * rate limiter is a real, shared-state singleton for the lifetime of this test
     * class's Spring context (JUnit caches and reuses it across test methods), so
     * every test that needs a session gets its own never-reused email rather than
     * repeatedly spending the bootstrap admin's rate-limit budget.
     */
    private LoggedInSession loginAsNewAdmin() {
        String email = "admin-" + UUID.randomUUID() + "@arooraa.test";
        String password = "correct-horse-battery-staple";
        jdbcTemplate.update("""
                insert into admin_users (id, email, password_hash, display_name, active, created_at, updated_at)
                values (?, ?, ?, ?, true, now(), now())
                """, UUID.randomUUID(), email, passwordEncoder.encode(password), "Test Admin");

        CookieJar jar = new CookieJar();
        call(jar, HttpMethod.GET, "/api/v1/admin/auth/session", null, String.class); // primes XSRF-TOKEN
        ResponseEntity<Map> response = login(jar, email, password);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        return new LoggedInSession(jar, UUID.fromString((String) response.getBody().get("id")));
    }

    private final class LoggedInSession {
        private final CookieJar jar;
        final UUID adminId;

        LoggedInSession(CookieJar jar, UUID adminId) {
            this.jar = jar;
            this.adminId = adminId;
        }

        <T> ResponseEntity<T> call(HttpMethod method, String path, Object body, Class<T> type) {
            return AdminIT.this.call(jar, method, path, body, type);
        }

        <T> ResponseEntity<T> callWithoutCsrfToken(HttpMethod method, String path, Object body, Class<T> type) {
            return AdminIT.this.call(jar, method, path, body, type, jar.headers(false));
        }

        <T> ResponseEntity<T> callWithWrongCsrfToken(HttpMethod method, String path, Object body, Class<T> type) {
            HttpHeaders headers = jar.headers(false);
            headers.set("X-XSRF-TOKEN", "not-the-real-token-" + UUID.randomUUID());
            return AdminIT.this.call(jar, method, path, body, type, headers);
        }
    }

    // ---- Authentication ----

    @Test
    void bootstrapAdminPasswordIsHashedNotPlaintext() {
        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select password_hash from admin_users where email = ?", BOOTSTRAP_EMAIL);
        String hash = (String) row.get("password_hash");
        assertTrue(hash.startsWith("$2"), "expected a bcrypt hash, got: " + hash);
        assertFalse(hash.contains(BOOTSTRAP_PASSWORD), "password hash must never contain the raw password");
    }

    @Test
    void validLoginWorks() {
        CookieJar jar = new CookieJar();
        call(jar, HttpMethod.GET, "/api/v1/admin/auth/session", null, String.class);
        ResponseEntity<Map> response = login(jar, BOOTSTRAP_EMAIL, BOOTSTRAP_PASSWORD);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(BOOTSTRAP_EMAIL, response.getBody().get("email"));
        assertNotNull(jar.get("JSESSIONID"));
    }

    @Test
    void wrongPasswordAndUnknownEmailReturnTheSameGenericMessage() {
        CookieJar jar = new CookieJar();
        call(jar, HttpMethod.GET, "/api/v1/admin/auth/session", null, String.class);

        ResponseEntity<Map> wrongPassword = login(jar, BOOTSTRAP_EMAIL, "not-the-real-password");
        ResponseEntity<Map> unknownEmail = login(jar, "nobody-at-all@arooraa.test", "whatever12345");

        assertEquals(HttpStatus.UNAUTHORIZED, wrongPassword.getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, unknownEmail.getStatusCode());
        assertEquals(wrongPassword.getBody().get("message"), unknownEmail.getBody().get("message"),
                "must not be possible to distinguish a wrong password from an unknown email");
    }

    @Test
    void inactiveAdminIsRejected() {
        UUID id = UUID.randomUUID();
        jdbcTemplate.update("""
                insert into admin_users (id, email, password_hash, display_name, active, created_at, updated_at)
                values (?, ?, ?, ?, false, now(), now())
                """, id, "inactive@arooraa.test",
                "$2a$10$abcdefghijklmnopqrstuuC7hR8s0yQe1v9kQeQeQeQeQeQeQeQe",
                "Inactive Admin");

        CookieJar jar = new CookieJar();
        call(jar, HttpMethod.GET, "/api/v1/admin/auth/session", null, String.class);
        ResponseEntity<Map> response = login(jar, "inactive@arooraa.test", "irrelevant-password");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void logoutInvalidatesTheSession() {
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Map> beforeLogout = session.call(HttpMethod.GET, "/api/v1/admin/auth/session", null, Map.class);
        assertEquals(HttpStatus.OK, beforeLogout.getStatusCode());

        ResponseEntity<Void> logout = session.call(HttpMethod.POST, "/api/v1/admin/auth/logout", null, Void.class);
        assertEquals(HttpStatus.NO_CONTENT, logout.getStatusCode());

        ResponseEntity<Map> afterLogout = session.call(HttpMethod.GET, "/api/v1/admin/auth/session", null, Map.class);
        assertEquals(HttpStatus.UNAUTHORIZED, afterLogout.getStatusCode());
    }

    @Test
    void unauthenticatedAdminApiCallReturns401() {
        CookieJar jar = new CookieJar();
        ResponseEntity<Map> response = call(jar, HttpMethod.GET, "/api/v1/admin/leads", null, Map.class);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("UNAUTHENTICATED", response.getBody().get("code"));
    }

    @Test
    void loginRateLimitingBlocksAfterConfiguredAttempts() {
        CookieJar jar = new CookieJar();
        call(jar, HttpMethod.GET, "/api/v1/admin/auth/session", null, String.class);
        String targetEmail = "rate-limit-target@arooraa.test";

        ResponseEntity<Map> r1 = login(jar, targetEmail, "x");
        ResponseEntity<Map> r2 = login(jar, targetEmail, "x");
        ResponseEntity<Map> r3 = login(jar, targetEmail, "x");
        ResponseEntity<Map> r4 = login(jar, targetEmail, "x");

        assertEquals(HttpStatus.UNAUTHORIZED, r1.getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, r2.getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, r3.getStatusCode());
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, r4.getStatusCode());
    }

    // ---- CSRF ----
    //
    // These prove the double-submit CSRF setup actually rejects a mismatched/missing token
    // for an authenticated admin mutation, not just that a valid token happens to work (every
    // other mutating test in this class already proves the valid-token path implicitly, since
    // LoggedInSession.call() always sends a correct X-XSRF-TOKEN derived from the real cookie).

    @Test
    void adminMutationWithoutCsrfTokenIsRejected() {
        ProjectEnquiry project = seedProjectEnquiry("Csrf Missing Token Person", "csrf-missing@example.com");
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Map> response = session.callWithoutCsrfToken(HttpMethod.PATCH,
                "/api/v1/admin/leads/PROJECT_ENQUIRY/" + project.getId() + "/status",
                Map.of("status", "CONTACTED"), Map.class);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("FORBIDDEN", response.getBody().get("code"));
    }

    @Test
    void adminMutationWithWrongCsrfTokenIsRejected() {
        ProjectEnquiry project = seedProjectEnquiry("Csrf Wrong Token Person", "csrf-wrong@example.com");
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Map> response = session.callWithWrongCsrfToken(HttpMethod.PATCH,
                "/api/v1/admin/leads/PROJECT_ENQUIRY/" + project.getId() + "/status",
                Map.of("status", "CONTACTED"), Map.class);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("FORBIDDEN", response.getBody().get("code"));
    }

    @Test
    void adminMutationWithValidCsrfTokenSucceeds() {
        ProjectEnquiry project = seedProjectEnquiry("Csrf Valid Token Person", "csrf-valid@example.com");
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Void> response = session.call(HttpMethod.PATCH,
                "/api/v1/admin/leads/PROJECT_ENQUIRY/" + project.getId() + "/status",
                Map.of("status", "CONTACTED"), Void.class);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void publicProjectEnquirySubmissionRemainsCsrfExempt() {
        // Deliberately no cookie jar, no session, and no CSRF token/cookie at all — proves
        // the public path is exempt outright, not merely tolerant of a primed-but-unused token.
        Map<String, Object> enquiryBody = new LinkedHashMap<>();
        enquiryBody.put("name", "Csrf Exempt Enquiry Person");
        enquiryBody.put("businessEmail", "csrf-exempt-enquiry@example.com");
        enquiryBody.put("phone", "+919876500197");
        enquiryBody.put("country", "India");
        enquiryBody.put("serviceType", "CUSTOM_SOFTWARE");
        enquiryBody.put("projectType", "NEW_PRODUCT");
        enquiryBody.put("description", "Proves the project-enquiry submission endpoint stays CSRF-exempt.");
        enquiryBody.put("existingSystem", false);
        enquiryBody.put("budgetRange", "FROM_2L_TO_5L");
        enquiryBody.put("timeline", "FROM_1_TO_3_MONTHS");
        enquiryBody.put("preferredContactMethod", "PHONE");

        ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl() + "/api/v1/project-enquiries", enquiryBody, Map.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void publicMesaDemoSubmissionRemainsCsrfExempt() {
        Map<String, Object> demoBody = new LinkedHashMap<>();
        demoBody.put("contactName", "Csrf Exempt Demo Contact");
        demoBody.put("restaurantName", "Csrf Exempt Demo Kitchen");
        demoBody.put("whatsappNumber", "9876500196");
        demoBody.put("city", "Chennai");
        demoBody.put("outletCount", "ONE");
        demoBody.put("restaurantType", "CASUAL_DINING");
        demoBody.put("primaryChallenge", "BILLING_POS");

        ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl() + "/api/v1/demo-requests", demoBody, Map.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void publicSubmissionEndpointsRemainPublicAfterAddingAdminSecurity() {
        Map<String, Object> demoBody = new LinkedHashMap<>();
        demoBody.put("contactName", "Priya Sharma");
        demoBody.put("restaurantName", "Security Regression Kitchen");
        demoBody.put("whatsappNumber", "9876500199");
        demoBody.put("city", "Chennai");
        demoBody.put("outletCount", "ONE");
        demoBody.put("restaurantType", "CASUAL_DINING");
        demoBody.put("primaryChallenge", "BILLING_POS");
        ResponseEntity<Map> demoResponse = restTemplate.postForEntity(
                baseUrl() + "/api/v1/demo-requests", demoBody, Map.class);
        assertEquals(HttpStatus.CREATED, demoResponse.getStatusCode());

        Map<String, Object> enquiryBody = new LinkedHashMap<>();
        enquiryBody.put("name", "Arun Kumar");
        enquiryBody.put("businessEmail", "security-regression@example.com");
        enquiryBody.put("phone", "+919876500198");
        enquiryBody.put("country", "India");
        enquiryBody.put("serviceType", "CUSTOM_SOFTWARE");
        enquiryBody.put("projectType", "NEW_PRODUCT");
        enquiryBody.put("description", "Security regression check for the project enquiry public endpoint.");
        enquiryBody.put("existingSystem", false);
        enquiryBody.put("budgetRange", "FROM_2L_TO_5L");
        enquiryBody.put("timeline", "FROM_1_TO_3_MONTHS");
        enquiryBody.put("preferredContactMethod", "PHONE");
        ResponseEntity<Map> enquiryResponse = restTemplate.postForEntity(
                baseUrl() + "/api/v1/project-enquiries", enquiryBody, Map.class);
        assertEquals(HttpStatus.CREATED, enquiryResponse.getStatusCode());
    }

    // ---- Lead management ----

    private DemoRequest seedDemoRequest(String contactName, String restaurantName) {
        DemoRequest entity = new DemoRequest(contactName, restaurantName, "+9198765" + (10000 + (int) (Math.random() * 9000)),
                "owner-" + UUID.randomUUID() + "@example.com", "Chennai", OutletCount.ONE, RestaurantType.CASUAL_DINING,
                PrimaryChallenge.BILLING_POS, null, null, null, null, "/", "seed-ip-hash", "JUnit", null, null, null, null);
        return demoRequestRepository.save(entity);
    }

    private ProjectEnquiry seedProjectEnquiry(String name, String enquiryEmail) {
        ProjectEnquiry entity = new ProjectEnquiry("ARO-2026-" + String.format("%06d", (int) (Math.random() * 900000)),
                name, "Seed Co", enquiryEmail, "+919876500200", "+919876500200", "India", ServiceType.CUSTOM_SOFTWARE,
                ProjectType.NEW_PRODUCT, "Seed description long enough to pass validation checks easily.", false,
                BudgetRange.FROM_2L_TO_5L, Timeline.FROM_1_TO_3_MONTHS, PreferredContactMethod.PHONE, "WEBSITE",
                "/start-project", "seed-ip-hash", "JUnit", null, null, null, null);
        return projectEnquiryRepository.save(entity);
    }

    @Test
    void combinedListSupportsTypeFilterSearchAndPagination() {
        DemoRequest demo = seedDemoRequest("List Test Contact", "List Test Kitchen");
        ProjectEnquiry project = seedProjectEnquiry("List Test Person", "list-test@example.com");
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Map> allLeads = session.call(HttpMethod.GET, "/api/v1/admin/leads?page=0&size=200", null, Map.class);
        assertEquals(HttpStatus.OK, allLeads.getStatusCode());
        List<Map<String, Object>> content = (List<Map<String, Object>>) allLeads.getBody().get("content");
        assertTrue(content.stream().anyMatch(l -> demo.getId().toString().equals(l.get("id"))));
        assertTrue(content.stream().anyMatch(l -> project.getId().toString().equals(l.get("id"))));

        ResponseEntity<Map> projectOnly = session.call(HttpMethod.GET,
                "/api/v1/admin/leads?leadType=PROJECT_ENQUIRY&page=0&size=200", null, Map.class);
        List<Map<String, Object>> projectContent = (List<Map<String, Object>>) projectOnly.getBody().get("content");
        assertTrue(projectContent.stream().allMatch(l -> "PROJECT_ENQUIRY".equals(l.get("leadType"))));
        assertTrue(projectContent.stream().anyMatch(l -> project.getId().toString().equals(l.get("id"))));

        ResponseEntity<Map> searchByName = session.call(HttpMethod.GET,
                "/api/v1/admin/leads?search=List+Test+Kitchen&page=0&size=200", null, Map.class);
        List<Map<String, Object>> searchContent = (List<Map<String, Object>>) searchByName.getBody().get("content");
        assertTrue(searchContent.stream().anyMatch(l -> demo.getId().toString().equals(l.get("id"))));

        ResponseEntity<Map> firstPage = session.call(HttpMethod.GET, "/api/v1/admin/leads?page=0&size=1", null, Map.class);
        assertEquals(1, ((List<?>) firstPage.getBody().get("content")).size());
        Map<String, Object> pageInfo = (Map<String, Object>) firstPage.getBody().get("page");
        assertTrue(((Number) pageInfo.get("totalElements")).intValue() >= 2);
    }

    @Test
    void projectEnquiryListShowsMaskedPhoneAndDirectionButNeverTheRawPhone() {
        ProjectEnquiry project = seedProjectEnquiry("List Masking Person", "list-masking@example.com");
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Map> response = session.call(HttpMethod.GET,
                "/api/v1/admin/leads?leadType=PROJECT_ENQUIRY&search=List+Masking+Person&page=0&size=20", null, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
        Map<String, Object> row = content.stream()
                .filter(l -> project.getId().toString().equals(l.get("id")))
                .findFirst()
                .orElseThrow();

        assertEquals("New Product", row.get("direction"));
        assertEquals("Phone", row.get("preferredContactMethod"));
        assertNotNull(row.get("maskedPhone"));
        assertFalse(row.get("maskedPhone").equals(project.getPhone()), "the list view must mask the phone number");
        assertTrue(row.get("maskedPhone").toString().contains("•"), "unexpected masked phone shape: " + row.get("maskedPhone"));
    }

    @Test
    void projectEnquiryDetailShowsSubmittedFieldsAndNeverExposesIpHash() {
        ProjectEnquiry project = seedProjectEnquiry("Detail Test Person", "detail-test@example.com");
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<String> raw = session.call(HttpMethod.GET,
                "/api/v1/admin/leads/PROJECT_ENQUIRY/" + project.getId(), null, String.class);

        assertEquals(HttpStatus.OK, raw.getStatusCode());
        assertFalse(raw.getBody().toLowerCase(java.util.Locale.ROOT).contains("iphash"));
        assertTrue(raw.getBody().contains("Service type"));
        assertTrue(raw.getBody().contains("Custom Software"));
    }

    @Test
    void mesaDemoDetailShowsSubmittedFieldsAndSyntheticReferenceAndNeverExposesIpHash() {
        DemoRequest demo = seedDemoRequest("Mesa Detail Contact", "Mesa Detail Kitchen");
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Map> response = session.call(HttpMethod.GET,
                "/api/v1/admin/leads/MESA_DEMO/" + demo.getId(), null, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        String reference = (String) response.getBody().get("referenceNumber");
        assertTrue(reference.matches("^MESA-[0-9A-F]{8}$"), "unexpected reference format: " + reference);
        assertFalse(response.getBody().toString().toLowerCase(java.util.Locale.ROOT).contains("iphash"));
    }

    @Test
    void nonexistentLeadReturns404() {
        LoggedInSession session = loginAsNewAdmin();
        ResponseEntity<Map> response = session.call(HttpMethod.GET,
                "/api/v1/admin/leads/PROJECT_ENQUIRY/" + UUID.randomUUID(), null, Map.class);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void invalidStatusValueReturns400() {
        ProjectEnquiry project = seedProjectEnquiry("Invalid Status Person", "invalid-status@example.com");
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Map> response = session.call(HttpMethod.PATCH,
                "/api/v1/admin/leads/PROJECT_ENQUIRY/" + project.getId() + "/status",
                Map.of("status", "NOT_A_REAL_STATUS"), Map.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void negativeEstimatedValueReturns400() {
        ProjectEnquiry project = seedProjectEnquiry("Negative Value Person", "negative-value@example.com");
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Map> response = session.call(HttpMethod.PATCH,
                "/api/v1/admin/leads/PROJECT_ENQUIRY/" + project.getId() + "/estimated-value",
                Map.of("estimatedValue", -500), Map.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void fullLeadLifecycle_statusFollowUpAssignmentValueLostReasonNotesAndActivity() {
        ProjectEnquiry project = seedProjectEnquiry("Lifecycle Test Person", "lifecycle-test@example.com");
        LoggedInSession session = loginAsNewAdmin();
        String base = "/api/v1/admin/leads/PROJECT_ENQUIRY/" + project.getId();

        // Status: NEW -> CONTACTED
        ResponseEntity<Void> statusUpdate = session.call(HttpMethod.PATCH, base + "/status",
                Map.of("status", "CONTACTED"), Void.class);
        assertEquals(HttpStatus.NO_CONTENT, statusUpdate.getStatusCode());

        // Follow-up
        ResponseEntity<Void> followUp = session.call(HttpMethod.PATCH, base + "/follow-up",
                Map.of("followUpAt", Instant.now().plusSeconds(3600).toString()), Void.class);
        assertEquals(HttpStatus.NO_CONTENT, followUp.getStatusCode());

        // Assignment to self (the logged-in test admin)
        UUID adminId = session.adminId;
        ResponseEntity<Void> assignment = session.call(HttpMethod.PATCH, base + "/assignment",
                Map.of("assignedAdminId", adminId.toString()), Void.class);
        assertEquals(HttpStatus.NO_CONTENT, assignment.getStatusCode());

        // Estimated value, currency defaulted to INR
        ResponseEntity<Void> value = session.call(HttpMethod.PATCH, base + "/estimated-value",
                Map.of("estimatedValue", 250000), Void.class);
        assertEquals(HttpStatus.NO_CONTENT, value.getStatusCode());

        // Two notes, must come back in chronological (creation) order
        ResponseEntity<Map> note1 = session.call(HttpMethod.POST, base + "/notes",
                Map.of("note", "First note about this lead."), Map.class);
        assertEquals(HttpStatus.CREATED, note1.getStatusCode());
        ResponseEntity<Map> note2 = session.call(HttpMethod.POST, base + "/notes",
                Map.of("note", "Second note, added after the first."), Map.class);
        assertEquals(HttpStatus.CREATED, note2.getStatusCode());

        // A required lost reason on LOST, and rejection when it's missing
        ResponseEntity<Map> lostWithoutReason = session.call(HttpMethod.PATCH, base + "/status",
                Map.of("status", "LOST"), Map.class);
        assertEquals(HttpStatus.BAD_REQUEST, lostWithoutReason.getStatusCode());

        ResponseEntity<Void> lostWithReason = session.call(HttpMethod.PATCH, base + "/status",
                Map.of("status", "LOST", "lostReason", "BUDGET"), Void.class);
        assertEquals(HttpStatus.NO_CONTENT, lostWithReason.getStatusCode());

        // Verify everything landed together (transactional consistency of the happy path) via detail
        ResponseEntity<Map> detail = session.call(HttpMethod.GET, base, null, Map.class);
        assertEquals(HttpStatus.OK, detail.getStatusCode());
        assertEquals("LOST", detail.getBody().get("status"));

        Map<String, Object> management = (Map<String, Object>) detail.getBody().get("managementInfo");
        assertEquals(adminId.toString(), management.get("assignedAdminId"));
        assertNotNull(management.get("followUpAt"));
        assertEquals("BUDGET", management.get("lostReason"));
        assertEquals("INR", management.get("estimatedValueCurrency"));

        List<Map<String, Object>> notes = (List<Map<String, Object>>) detail.getBody().get("notes");
        assertEquals(2, notes.size());
        assertEquals("First note about this lead.", notes.get(0).get("note"));
        assertEquals("Second note, added after the first.", notes.get(1).get("note"));

        List<Map<String, Object>> activity = (List<Map<String, Object>>) detail.getBody().get("activity");
        List<String> activityTypes = activity.stream().map(a -> (String) a.get("activityType")).toList();
        assertTrue(activityTypes.contains("STATUS_CHANGED"));
        assertTrue(activityTypes.contains("FOLLOW_UP_SET"));
        assertTrue(activityTypes.contains("ASSIGNED_CHANGED"));
        assertTrue(activityTypes.contains("ESTIMATED_VALUE_SET"));
        assertTrue(activityTypes.contains("NOTE_ADDED"));
        // note content must never leak into the audit trail
        assertTrue(activity.stream().noneMatch(a ->
                "First note about this lead.".equals(a.get("oldValue")) || "First note about this lead.".equals(a.get("newValue"))));
    }

    @Test
    void dashboardReturnsUniformCountsAcrossBothLeadTypes() {
        seedDemoRequest("Dashboard Contact", "Dashboard Kitchen");
        seedProjectEnquiry("Dashboard Person", "dashboard-test@example.com");
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Map> response = session.call(HttpMethod.GET,
                "/api/v1/admin/dashboard?timezone=Asia/Kolkata", null, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(((Number) response.getBody().get("newProjectEnquiries")).longValue() >= 1);
        assertTrue(((Number) response.getBody().get("newMesaDemoRequests")).longValue() >= 1);
        assertTrue(((Number) response.getBody().get("totalNewLeads")).longValue() >= 2);
    }

    // ---- Lead captures (POST /api/v1/lead-captures) in the admin ----
    //
    // Created through the real public endpoint, not seeded, so the whole path from the consultation
    // form to the admin workflow is exercised. A capture has no name/email by design.

    private static final String CAPTURE_CONSENT = "I agree that AROORAA may contact me on this number about this enquiry.";

    private String randomMobile() {
        return String.format("+9198%08d", (int) (Math.random() * 100_000_000));
    }

    /** Distinct client IP per call, so the capture endpoint's per-IP rate limit never interferes. */
    private String submitLeadCapture(String phone, String requirement) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("requirement", requirement);
        body.put("phone", phone);
        body.put("countryCode", "IN");
        body.put("consent", true);
        body.put("consentText", CAPTURE_CONSENT);
        body.put("sourceLocale", "ta");
        body.put("source", "WEBSITE");
        body.put("sourcePage", "/ta/grow-your-business");
        body.put("utmCampaign", "tn-growth");
        body.put("website", "");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Forwarded-For", "10.70." + (int) (Math.random() * 250) + "." + (int) (1 + Math.random() * 250));
        // Deliberately no cookies or CSRF token: the public endpoint must stay exempt.
        ResponseEntity<Map> response = restTemplate.exchange(baseUrl() + "/api/v1/lead-captures",
                HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        return (String) response.getBody().get("leadReference");
    }

    private UUID captureIdFor(String reference) {
        return jdbcTemplate.queryForObject("select id from lead_captures where lead_reference = ?", UUID.class, reference);
    }

    @Test
    void leadCaptureFromThePublicFormIsListedAndSearchableWithNoInventedIdentity() {
        String phone = randomMobile();
        String reference = submitLeadCapture(phone, "AI_AUTOMATION");
        UUID id = captureIdFor(reference);
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<Map> byReference = session.call(HttpMethod.GET,
                "/api/v1/admin/leads?leadType=LEAD_CAPTURE&search=" + reference + "&page=0&size=20", null, Map.class);
        assertEquals(HttpStatus.OK, byReference.getStatusCode());
        List<Map<String, Object>> rows = (List<Map<String, Object>>) byReference.getBody().get("content");
        Map<String, Object> row = rows.stream().filter(l -> id.toString().equals(l.get("id"))).findFirst().orElseThrow();

        assertEquals("LEAD_CAPTURE", row.get("leadType"));
        assertEquals(reference, row.get("referenceNumber"));
        assertEquals("NEW", row.get("status"));
        assertEquals("Ai Automation", row.get("direction"), "the requirement is shown as the direction");
        // Existing response fields stay present for old clients, but are null — never invented.
        for (String identityField : List.of("customerName", "email", "companyOrRestaurant", "cityOrCountry")) {
            assertTrue(row.containsKey(identityField), "field must stay in the response: " + identityField);
            assertNull(row.get(identityField), identityField + " must be null for a capture");
        }
        assertNotNull(row.get("maskedPhone"));
        assertTrue(row.get("maskedPhone").toString().contains("•"));
        assertNotEquals(phone, row.get("maskedPhone"));

        // Search also matches the (normalised) phone number, and the reference case-insensitively.
        ResponseEntity<Map> byPhone = session.call(HttpMethod.GET,
                "/api/v1/admin/leads?search=" + phone.substring(3) + "&page=0&size=200", null, Map.class);
        assertTrue(((List<Map<String, Object>>) byPhone.getBody().get("content")).stream()
                .anyMatch(l -> id.toString().equals(l.get("id"))));
        ResponseEntity<Map> lowerCaseRef = session.call(HttpMethod.GET,
                "/api/v1/admin/leads?search=" + reference.toLowerCase(java.util.Locale.ROOT) + "&page=0&size=200", null, Map.class);
        assertTrue(((List<Map<String, Object>>) lowerCaseRef.getBody().get("content")).stream()
                .anyMatch(l -> id.toString().equals(l.get("id"))));

        // Status filter applies to captures too.
        ResponseEntity<Map> wonOnly = session.call(HttpMethod.GET,
                "/api/v1/admin/leads?leadType=LEAD_CAPTURE&status=WON&search=" + reference + "&page=0&size=20", null, Map.class);
        assertTrue(((List<?>) wonOnly.getBody().get("content")).isEmpty());
    }

    @Test
    void leadCaptureDetailShowsRequirementPhoneLanguageConsentAndSourceButNoInternalColumns() {
        String phone = randomMobile();
        String reference = submitLeadCapture(phone, "WEBSITE");
        UUID id = captureIdFor(reference);
        String ipHash = jdbcTemplate.queryForObject("select ip_hash from lead_captures where id = ?", String.class, id);
        LoggedInSession session = loginAsNewAdmin();

        ResponseEntity<String> raw = session.call(HttpMethod.GET,
                "/api/v1/admin/leads/LEAD_CAPTURE/" + id, null, String.class);
        assertEquals(HttpStatus.OK, raw.getStatusCode());
        String lowered = raw.getBody().toLowerCase(java.util.Locale.ROOT);
        assertFalse(lowered.contains("iphash"));
        assertFalse(raw.getBody().contains(ipHash), "the ip hash value must never be exposed");
        assertFalse(lowered.contains("idempotency"));
        assertFalse(lowered.contains("fingerprint"));

        ResponseEntity<Map> detail = session.call(HttpMethod.GET,
                "/api/v1/admin/leads/LEAD_CAPTURE/" + id, null, Map.class);
        Map<String, Object> body = detail.getBody();
        assertEquals("LEAD_CAPTURE", body.get("leadType"));
        assertEquals(reference, body.get("referenceNumber"));
        assertEquals(phone, body.get("phone"), "the authenticated detail view shows the real number");
        assertTrue(body.containsKey("customerName"));
        assertNull(body.get("customerName"), "no name was collected, so none may be shown");
        assertNull(body.get("email"), "no email was collected, so none may be shown");

        Map<String, String> fields = (Map<String, String>) body.get("submittedFields");
        assertEquals("Website", fields.get("Requirement"));
        assertEquals("Tamil", fields.get("Page language"));
        assertFalse(fields.containsKey("Preferred language"), "unset until the customer chooses in the conversation");
        assertEquals("Yes", fields.get("Consent given"));
        assertEquals("Web Form", fields.get("Consent source"));
        assertEquals(CAPTURE_CONSENT, fields.get("Consent text"));
        assertNotNull(fields.get("Consent recorded at"));
        assertEquals("Website", fields.get("Source"));
        assertEquals("/ta/grow-your-business", fields.get("Source page"));
        assertEquals("tn-growth", fields.get("UTM campaign"));
    }

    @Test
    void leadCaptureSupportsTheFullAdminWorkflowWithOptimisticLocking() {
        String reference = submitLeadCapture(randomMobile(), "MARKETING_LEADS");
        UUID id = captureIdFor(reference);
        LoggedInSession session = loginAsNewAdmin();
        String base = "/api/v1/admin/leads/LEAD_CAPTURE/" + id;

        long leadVersion = ((Number) session.call(HttpMethod.GET, base, null, Map.class).getBody().get("leadVersion")).longValue();
        Map<String, Object> statusBody = new LinkedHashMap<>();
        statusBody.put("status", "CONTACTED");
        statusBody.put("expectedVersion", leadVersion);
        assertEquals(HttpStatus.NO_CONTENT, session.call(HttpMethod.PATCH, base + "/status", statusBody, Void.class).getStatusCode());
        assertEquals("CONTACTED", jdbcTemplate.queryForObject("select status from lead_captures where id = ?", String.class, id));

        // Same (now stale) version again -> 409, and nothing changes.
        Map<String, Object> staleBody = new LinkedHashMap<>();
        staleBody.put("status", "QUALIFIED");
        staleBody.put("expectedVersion", leadVersion);
        ResponseEntity<Map> stale = session.call(HttpMethod.PATCH, base + "/status", staleBody, Map.class);
        assertEquals(HttpStatus.CONFLICT, stale.getStatusCode());
        assertEquals("CONTACTED", jdbcTemplate.queryForObject("select status from lead_captures where id = ?", String.class, id));

        Map<String, Object> followUpBody = new LinkedHashMap<>();
        followUpBody.put("followUpAt", Instant.now().plusSeconds(3600).toString());
        followUpBody.put("expectedVersion", 0);
        assertEquals(HttpStatus.NO_CONTENT, session.call(HttpMethod.PATCH, base + "/follow-up", followUpBody, Void.class).getStatusCode());

        // Management version moved to 1 with the follow-up; an assignment against version 0 is stale.
        Map<String, Object> staleAssignment = new LinkedHashMap<>();
        staleAssignment.put("assignedAdminId", session.adminId.toString());
        staleAssignment.put("expectedVersion", 0);
        assertEquals(HttpStatus.CONFLICT, session.call(HttpMethod.PATCH, base + "/assignment", staleAssignment, Map.class).getStatusCode());

        long managementVersion = ((Number) ((Map<String, Object>) session.call(HttpMethod.GET, base, null, Map.class)
                .getBody().get("managementInfo")).get("version")).longValue();
        Map<String, Object> assignment = new LinkedHashMap<>();
        assignment.put("assignedAdminId", session.adminId.toString());
        assignment.put("expectedVersion", managementVersion);
        assertEquals(HttpStatus.NO_CONTENT, session.call(HttpMethod.PATCH, base + "/assignment", assignment, Void.class).getStatusCode());

        assertEquals(HttpStatus.NO_CONTENT, session.call(HttpMethod.PATCH, base + "/estimated-value",
                Map.of("estimatedValue", 40000), Void.class).getStatusCode());
        assertEquals(HttpStatus.CREATED, session.call(HttpMethod.POST, base + "/notes",
                Map.of("note", "Called; prefers evenings."), Map.class).getStatusCode());

        assertEquals(HttpStatus.BAD_REQUEST, session.call(HttpMethod.PATCH, base + "/status",
                Map.of("status", "LOST"), Map.class).getStatusCode());
        assertEquals(HttpStatus.NO_CONTENT, session.call(HttpMethod.PATCH, base + "/status",
                Map.of("status", "LOST", "lostReason", "NO_RESPONSE"), Void.class).getStatusCode());

        Map<String, Object> detail = session.call(HttpMethod.GET, base, null, Map.class).getBody();
        assertEquals("LOST", detail.get("status"));
        Map<String, Object> management = (Map<String, Object>) detail.get("managementInfo");
        assertEquals(session.adminId.toString(), management.get("assignedAdminId"));
        assertNotNull(management.get("followUpAt"));
        assertEquals("NO_RESPONSE", management.get("lostReason"));
        assertEquals("INR", management.get("estimatedValueCurrency"));

        List<Map<String, Object>> notes = (List<Map<String, Object>>) detail.get("notes");
        assertEquals(1, notes.size());
        assertEquals("Called; prefers evenings.", notes.get(0).get("note"));

        List<String> activityTypes = ((List<Map<String, Object>>) detail.get("activity")).stream()
                .map(a -> (String) a.get("activityType")).toList();
        for (String expected : List.of("STATUS_CHANGED", "FOLLOW_UP_SET", "ASSIGNED_CHANGED", "ESTIMATED_VALUE_SET", "NOTE_ADDED")) {
            assertTrue(activityTypes.contains(expected), "missing activity: " + expected);
        }

        // Every overlay row was written under LEAD_CAPTURE, never under another type.
        assertEquals(0, jdbcTemplate.queryForObject(
                "select count(*) from lead_management where lead_id = ? and lead_type <> 'LEAD_CAPTURE'", Integer.class, id));
        assertEquals(0, jdbcTemplate.queryForObject(
                "select count(*) from lead_activity where lead_id = ? and lead_type <> 'LEAD_CAPTURE'", Integer.class, id));
    }

    @Test
    void leadCaptureAdminEndpointsRejectUnauthenticatedAndCsrfLessCalls() {
        String reference = submitLeadCapture(randomMobile(), "WEBSITE");
        UUID id = captureIdFor(reference);
        String base = "/api/v1/admin/leads/LEAD_CAPTURE/" + id;

        CookieJar anonymous = new CookieJar();
        ResponseEntity<Map> list = call(anonymous, HttpMethod.GET, "/api/v1/admin/leads?leadType=LEAD_CAPTURE", null, Map.class);
        assertEquals(HttpStatus.UNAUTHORIZED, list.getStatusCode());
        ResponseEntity<String> detail = call(anonymous, HttpMethod.GET, base, null, String.class);
        assertEquals(HttpStatus.UNAUTHORIZED, detail.getStatusCode());
        assertFalse(detail.getBody() != null && detail.getBody().contains(reference), "no lead data before login");

        ResponseEntity<Map> anonymousStatus = call(anonymous, HttpMethod.PATCH, base + "/status",
                Map.of("status", "CONTACTED"), Map.class);
        assertTrue(anonymousStatus.getStatusCode() == HttpStatus.UNAUTHORIZED
                || anonymousStatus.getStatusCode() == HttpStatus.FORBIDDEN, "got " + anonymousStatus.getStatusCode());
        ResponseEntity<Map> anonymousNote = call(anonymous, HttpMethod.POST, base + "/notes", Map.of("note", "x"), Map.class);
        assertTrue(anonymousNote.getStatusCode() == HttpStatus.UNAUTHORIZED
                || anonymousNote.getStatusCode() == HttpStatus.FORBIDDEN, "got " + anonymousNote.getStatusCode());

        LoggedInSession session = loginAsNewAdmin();
        ResponseEntity<Map> withoutCsrf = session.callWithoutCsrfToken(HttpMethod.PATCH, base + "/status",
                Map.of("status", "CONTACTED"), Map.class);
        assertEquals(HttpStatus.FORBIDDEN, withoutCsrf.getStatusCode());

        assertEquals("NEW", jdbcTemplate.queryForObject("select status from lead_captures where id = ?", String.class, id));
        assertEquals(0, jdbcTemplate.queryForObject("select count(*) from lead_notes where lead_id = ?", Integer.class, id));
    }

    @Test
    void leadCapturesAreIsolatedFromTheOtherLeadTypes() {
        String reference = submitLeadCapture(randomMobile(), "BUSINESS_APPLICATION");
        UUID captureId = captureIdFor(reference);
        DemoRequest demo = seedDemoRequest("Isolation Contact", "Isolation Kitchen");
        LoggedInSession session = loginAsNewAdmin();

        // A capture id is not a MESA demo or a project enquiry, and vice versa.
        assertEquals(HttpStatus.NOT_FOUND, session.call(HttpMethod.GET,
                "/api/v1/admin/leads/MESA_DEMO/" + captureId, null, Map.class).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, session.call(HttpMethod.GET,
                "/api/v1/admin/leads/PROJECT_ENQUIRY/" + captureId, null, Map.class).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, session.call(HttpMethod.GET,
                "/api/v1/admin/leads/LEAD_CAPTURE/" + demo.getId(), null, Map.class).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, session.call(HttpMethod.POST,
                "/api/v1/admin/leads/MESA_DEMO/" + captureId + "/notes", Map.of("note", "wrong type"), Map.class).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, session.call(HttpMethod.PATCH,
                "/api/v1/admin/leads/LEAD_CAPTURE/" + demo.getId() + "/status", Map.of("status", "CONTACTED"), Map.class).getStatusCode());

        List<Map<String, Object>> captureOnly = (List<Map<String, Object>>) session.call(HttpMethod.GET,
                "/api/v1/admin/leads?leadType=LEAD_CAPTURE&page=0&size=200", null, Map.class).getBody().get("content");
        assertTrue(captureOnly.stream().allMatch(l -> "LEAD_CAPTURE".equals(l.get("leadType"))));
        assertTrue(captureOnly.stream().anyMatch(l -> captureId.toString().equals(l.get("id"))));

        for (String otherType : List.of("MESA_DEMO", "PROJECT_ENQUIRY")) {
            List<Map<String, Object>> other = (List<Map<String, Object>>) session.call(HttpMethod.GET,
                    "/api/v1/admin/leads?leadType=" + otherType + "&page=0&size=200", null, Map.class).getBody().get("content");
            assertTrue(other.stream().noneMatch(l -> captureId.toString().equals(l.get("id"))),
                    "a capture must never be listed as " + otherType);
        }

        List<Map<String, Object>> all = (List<Map<String, Object>>) session.call(HttpMethod.GET,
                "/api/v1/admin/leads?page=0&size=200", null, Map.class).getBody().get("content");
        assertTrue(all.stream().anyMatch(l -> captureId.toString().equals(l.get("id")) && "LEAD_CAPTURE".equals(l.get("leadType"))));
        assertTrue(all.stream().anyMatch(l -> demo.getId().toString().equals(l.get("id")) && "MESA_DEMO".equals(l.get("leadType"))));
    }

    @Test
    void dashboardAndFollowUpFiltersIncludeLeadCaptures() {
        String reference = submitLeadCapture(randomMobile(), "CUSTOMER_ENQUIRIES");
        UUID id = captureIdFor(reference);
        LoggedInSession session = loginAsNewAdmin();

        Map<String, Object> dashboard = session.call(HttpMethod.GET,
                "/api/v1/admin/dashboard?timezone=Asia/Kolkata", null, Map.class).getBody();
        long newCaptures = ((Number) dashboard.get("newLeadCaptures")).longValue();
        assertTrue(newCaptures >= 1);
        assertEquals(((Number) dashboard.get("newProjectEnquiries")).longValue()
                        + ((Number) dashboard.get("newMesaDemoRequests")).longValue() + newCaptures,
                ((Number) dashboard.get("totalNewLeads")).longValue(), "the total includes captures");

        // A follow-up two days ago is overdue in every timezone.
        assertEquals(HttpStatus.NO_CONTENT, session.call(HttpMethod.PATCH, "/api/v1/admin/leads/LEAD_CAPTURE/" + id + "/follow-up",
                Map.of("followUpAt", Instant.now().minusSeconds(2 * 86_400).toString()), Void.class).getStatusCode());

        List<Map<String, Object>> overdue = (List<Map<String, Object>>) session.call(HttpMethod.GET,
                "/api/v1/admin/leads?leadType=LEAD_CAPTURE&followUp=OVERDUE&timezone=Asia/Kolkata&page=0&size=200",
                null, Map.class).getBody().get("content");
        assertTrue(overdue.stream().anyMatch(l -> id.toString().equals(l.get("id"))));

        long overdueCount = ((Number) session.call(HttpMethod.GET, "/api/v1/admin/dashboard?timezone=Asia/Kolkata",
                null, Map.class).getBody().get("overdueFollowUps")).longValue();
        assertTrue(overdueCount >= 1);
    }

    @Test
    void flywayMigrationCreatedAdminAndLeadManagementTables() {
        for (String table : List.of("admin_users", "lead_management", "lead_notes", "lead_activity")) {
            List<String> columns = jdbcTemplate.queryForList(
                    "select column_name from information_schema.columns where table_name = ?", String.class, table);
            assertFalse(columns.isEmpty(), "expected table to exist: " + table);
        }
        List<String> leadManagementColumns = jdbcTemplate.queryForList(
                "select column_name from information_schema.columns where table_name = 'lead_management'", String.class);
        for (String expected : List.of("lead_type", "lead_id", "assigned_admin_id", "follow_up_at", "estimated_value",
                "estimated_value_currency", "lost_reason", "internal_summary", "last_contacted_at", "version")) {
            assertTrue(leadManagementColumns.contains(expected), "missing expected lead_management column: " + expected);
        }
    }
}
