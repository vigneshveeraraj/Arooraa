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
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
            String csrf = cookies.get("XSRF-TOKEN");
            if (csrf != null) {
                headers.set("X-XSRF-TOKEN", csrf);
            }
            return headers;
        }
    }

    private <T> ResponseEntity<T> call(CookieJar jar, HttpMethod method, String path, Object body, Class<T> type) {
        ResponseEntity<T> response = restTemplate.exchange(baseUrl() + path, method, new HttpEntity<>(body, jar.headers()), type);
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
