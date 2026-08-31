package com.arooraa.leads.project.notification.integration;

import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.SubmissionVersion;
import com.arooraa.leads.project.domain.Timeline;
import com.arooraa.leads.project.notification.domain.NotificationOutbox;
import com.arooraa.leads.project.notification.domain.NotificationOutboxStatus;
import com.arooraa.leads.project.notification.domain.NotificationType;
import com.arooraa.leads.project.notification.mail.MailGateway;
import com.arooraa.leads.project.notification.mail.RetryableMailDeliveryException;
import com.arooraa.leads.project.notification.repository.NotificationOutboxRepository;
import com.arooraa.leads.project.notification.service.NotificationOutboxProcessor;
import com.arooraa.leads.project.notification.service.NotificationOutboxWorker;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.project.service.ProjectEnquirySubmitOutcome;
import com.arooraa.leads.project.service.ProjectEnquiryService;
import com.arooraa.leads.project.web.dto.ProjectEnquiryCreateRequest;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Full-stack W3.2C coverage against a real Postgres instance: outbox creation, idempotency
 * interaction, transactional atomicity, restart recovery, retry/permanent-failure, request/
 * mail-delivery independence, and DB-level concurrent claiming. The worker's cadence is set to an
 * hour below so its real {@code @Scheduled} tick never fires during a test — every test drives
 * {@link NotificationOutboxProcessor} (or, for one end-to-end check, {@link NotificationOutboxWorker}
 * directly) synchronously instead, so nothing here is timing-dependent (W3.2C §56).
 * {@link MailGateway} is a Mockito bean (never real SMTP), so no test in this class can ever send
 * a real email (W3.2C §6).
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class NotificationOutboxIT {

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

        registry.add("arooraa.lead-notifications.enabled", () -> true);
        registry.add("arooraa.lead-notifications.mail-from", () -> "no-reply@arooraa.test");
        registry.add("arooraa.lead-notifications.mail-reply-to", () -> "hello@arooraa.test");
        registry.add("arooraa.lead-notifications.sales-notification-to", () -> "sales@arooraa.test");
        // Effectively never, so the real @Scheduled tick can't race with a test driving the
        // worker directly.
        registry.add("arooraa.lead-notifications.worker.cadence-seconds", () -> 3600);
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private NotificationOutboxRepository outboxRepository;

    @Autowired
    private ProjectEnquiryRepository projectEnquiryRepository;

    @Autowired
    private ProjectEnquiryService projectEnquiryService;

    @Autowired
    private NotificationOutboxProcessor processor;

    @Autowired
    private NotificationOutboxWorker worker;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @MockitoBean
    private MailGateway mailGateway;

    private ResponseEntity<Map> postEnquiry(String syntheticClientIp, Map<String, Object> body, String idempotencyKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Forwarded-For", syntheticClientIp);
        if (idempotencyKey != null) {
            headers.set("Idempotency-Key", idempotencyKey);
        }
        return restTemplate.exchange("http://localhost:" + port + "/api/v1/project-enquiries",
                HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
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

    private static Map<String, Object> validLegacyBody(String email, String phone) {
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
    void newGuidedEnquiryCreatesExactlyTwoNotificationIntentsBothPending() {
        ResponseEntity<Map> response = postEnquiry("10.30.10.1",
                validGuidedBody("outbox-guided@example.com", "+919876510101"), "outbox-guided-key-1");
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        UUID enquiryId = UUID.fromString((String) response.getBody().get("enquiryId"));

        List<NotificationOutbox> rows = outboxRepository.findByProjectEnquiryId(enquiryId);
        assertEquals(2, rows.size());
        assertTrue(rows.stream().anyMatch(r -> r.getNotificationType() == NotificationType.CUSTOMER_ACKNOWLEDGEMENT));
        assertTrue(rows.stream().anyMatch(r -> r.getNotificationType() == NotificationType.INTERNAL_SALES_ALERT));
        assertTrue(rows.stream().allMatch(r -> r.getStatus() == NotificationOutboxStatus.PENDING));
        assertTrue(rows.stream().allMatch(r -> r.getAttemptCount() == 0));
    }

    @Test
    void newLegacyEnquiryAlsoCreatesExactlyTwoNotificationIntents() {
        ResponseEntity<Map> response =
                postEnquiry("10.30.10.2", validLegacyBody("outbox-legacy@example.com", "+919876510102"), null);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        UUID enquiryId = UUID.fromString((String) response.getBody().get("enquiryId"));

        assertEquals(2, outboxRepository.findByProjectEnquiryId(enquiryId).size());
    }

    @Test
    void idempotencyReplayDoesNotCreateAdditionalNotificationIntents() {
        Map<String, Object> body = validGuidedBody("outbox-replay@example.com", "+919876510103");
        ResponseEntity<Map> first = postEnquiry("10.30.10.3", body, "outbox-replay-key");
        assertEquals(HttpStatus.CREATED, first.getStatusCode());
        UUID enquiryId = UUID.fromString((String) first.getBody().get("enquiryId"));

        ResponseEntity<Map> second = postEnquiry("10.30.10.3", body, "outbox-replay-key");
        assertEquals(HttpStatus.OK, second.getStatusCode());

        assertEquals(2, outboxRepository.findByProjectEnquiryId(enquiryId).size());
    }

    @Test
    void twoDistinctEnquiriesEachGetTheirOwnIndependentPairOfIntents() {
        ResponseEntity<Map> a = postEnquiry("10.30.10.4",
                validGuidedBody("outbox-multi-a@example.com", "+919876510104"), "outbox-multi-key-a");
        ResponseEntity<Map> b = postEnquiry("10.30.10.4",
                validGuidedBody("outbox-multi-b@example.com", "+919876510105"), "outbox-multi-key-b");
        UUID idA = UUID.fromString((String) a.getBody().get("enquiryId"));
        UUID idB = UUID.fromString((String) b.getBody().get("enquiryId"));

        assertEquals(2, outboxRepository.findByProjectEnquiryId(idA).size());
        assertEquals(2, outboxRepository.findByProjectEnquiryId(idB).size());
    }

    @Test
    void uniqueIndexRejectsASecondRowForTheSamePairRegardlessOfApplicationLogic() {
        ResponseEntity<Map> response = postEnquiry("10.30.10.5",
                validGuidedBody("outbox-unique@example.com", "+919876510106"), "outbox-unique-key");
        UUID enquiryId = UUID.fromString((String) response.getBody().get("enquiryId"));

        assertThrows(org.springframework.dao.DataIntegrityViolationException.class, () ->
                outboxRepository.saveAndFlush(new NotificationOutbox(enquiryId, NotificationType.CUSTOMER_ACKNOWLEDGEMENT)));
    }

    @Test
    void rollbackOfEnclosingTransactionLeavesNoOrphanEnquiryOrOutboxRows() {
        ProjectEnquiryCreateRequest request = new ProjectEnquiryCreateRequest(
                "Rollback Test", "Rollback Co", "rollback-test@example.com", "+919876510107", "India",
                ServiceType.CUSTOM_SOFTWARE, ProjectType.NEW_PRODUCT,
                "We need a logistics tracking platform for our operations.", false,
                BudgetRange.FROM_2L_TO_5L, Timeline.FROM_1_TO_3_MONTHS, PreferredContactMethod.PHONE,
                "WEBSITE", "/start-project", null, null, null, null, "");

        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        UUID[] savedId = new UUID[1];

        assertThrows(IllegalStateException.class, () -> tx.executeWithoutResult(status -> {
            ProjectEnquirySubmitOutcome outcome =
                    projectEnquiryService.submit(request, "hashed-ip-rollback", "JUnit-Agent");
            savedId[0] = outcome.body().enquiryId();
            throw new IllegalStateException("forced rollback for test");
        }));

        assertNotNull(savedId[0]);
        Integer enquiryCount = jdbcTemplate.queryForObject(
                "select count(*) from project_enquiries where id = ?", Integer.class, savedId[0]);
        Integer outboxCount = jdbcTemplate.queryForObject(
                "select count(*) from project_enquiry_notification_outbox where project_enquiry_id = ?",
                Integer.class, savedId[0]);
        assertEquals(0, enquiryCount);
        assertEquals(0, outboxCount);
    }

    @Test
    void restartRecoverySimulation_preExistingPendingRowIsPickedUpAndSentByTheWorker() {
        drainAllPending();
        reset(mailGateway);
        ProjectEnquiry enquiry = persistBareEnquiry("restart-recovery@example.com", "+919876510108");
        // Simulates a row that was already PENDING before an application restart — never held
        // in any in-memory queue, only in the database (W3.2C §35).
        NotificationOutbox row = outboxRepository.save(
                new NotificationOutbox(enquiry.getId(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT));

        // Exercised via the real @Scheduled entry point (not the processor directly) for one
        // end-to-end proof that NotificationOutboxWorker.tick() actually drains eligible rows.
        worker.tick();

        NotificationOutbox reloaded = outboxRepository.findById(row.getId()).orElseThrow();
        assertEquals(NotificationOutboxStatus.SENT, reloaded.getStatus());
        assertNotNull(reloaded.getSentAt());
        verify(mailGateway, atLeastOnce()).send(any());
    }

    @Test
    void retryableFailureThenSuccessEndsInSentWithCorrectAttemptCount() {
        drainAllPending();
        reset(mailGateway);
        ProjectEnquiry enquiry = persistBareEnquiry("retry-then-success@example.com", "+919876510109");
        NotificationOutbox row = outboxRepository.save(
                new NotificationOutbox(enquiry.getId(), NotificationType.INTERNAL_SALES_ALERT));

        doThrow(new RetryableMailDeliveryException("SMTP_TIMEOUT", "timed out", null))
                .doNothing()
                .when(mailGateway).send(any());

        assertTrue(processor.claimAndProcessOne());
        NotificationOutbox afterFirstAttempt = outboxRepository.findById(row.getId()).orElseThrow();
        assertEquals(NotificationOutboxStatus.RETRY, afterFirstAttempt.getStatus());
        assertEquals(1, afterFirstAttempt.getAttemptCount());

        // Force it eligible again immediately rather than waiting on the real backoff delay.
        // Safely in the past (not just "now()") so this can never lose a race against clock
        // skew between the Postgres container and the JVM computing claimNext's own Instant.now().
        jdbcTemplate.update(
                "update project_enquiry_notification_outbox set next_attempt_at = now() - interval '1 hour' where id = ?",
                row.getId());

        assertTrue(processor.claimAndProcessOne());
        NotificationOutbox afterSecondAttempt = outboxRepository.findById(row.getId()).orElseThrow();
        assertEquals(NotificationOutboxStatus.SENT, afterSecondAttempt.getStatus());
        assertEquals(2, afterSecondAttempt.getAttemptCount());
        assertNotNull(afterSecondAttempt.getSentAt());
        verify(mailGateway, times(2)).send(any());
    }

    @Test
    void permanentFailureAfterMaxAttemptsLeavesEnquiryFullyIntact() {
        drainAllPending();
        reset(mailGateway);
        ProjectEnquiry enquiry = persistBareEnquiry("permanent-failure@example.com", "+919876510110");
        NotificationOutbox row = outboxRepository.save(
                new NotificationOutbox(enquiry.getId(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT));
        doThrow(new RetryableMailDeliveryException("SMTP_TIMEOUT", "timed out", null)).when(mailGateway).send(any());

        for (int attempt = 1; attempt <= 5; attempt++) {
            // Safely in the past — see the comment on the equivalent update() above.
            jdbcTemplate.update(
                    "update project_enquiry_notification_outbox set next_attempt_at = now() - interval '1 hour' where id = ?",
                    row.getId());
            assertTrue(processor.claimAndProcessOne());
        }

        NotificationOutbox reloaded = outboxRepository.findById(row.getId()).orElseThrow();
        assertEquals(NotificationOutboxStatus.FAILED, reloaded.getStatus());
        assertEquals(5, reloaded.getAttemptCount());

        ProjectEnquiry stillIntact = projectEnquiryRepository.findById(enquiry.getId()).orElseThrow();
        assertEquals("NEW", stillIntact.getStatus().name());
        assertEquals(enquiry.getBusinessEmail(), stillIntact.getBusinessEmail());
    }

    @Test
    void enquirySubmissionSucceedsAndStaysIntactEvenWhenMailGatewayIsCompletelyUnavailable() {
        drainAllPending();
        reset(mailGateway);
        doThrow(new RetryableMailDeliveryException("CONNECTION_REFUSED", "provider unreachable", null))
                .when(mailGateway).send(any());

        ResponseEntity<Map> response = postEnquiry("10.30.10.11",
                validGuidedBody("gateway-down@example.com", "+919876510111"), "gateway-down-key");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        String reference = (String) response.getBody().get("enquiryNumber");
        assertTrue(reference.matches("^ARO-\\d{4}-\\d{6}$"));
        UUID enquiryId = UUID.fromString((String) response.getBody().get("enquiryId"));

        // Drive both intents through the (failing) gateway explicitly rather than waiting on
        // the real scheduler.
        assertTrue(processor.claimAndProcessOne());
        assertTrue(processor.claimAndProcessOne());

        List<NotificationOutbox> rows = outboxRepository.findByProjectEnquiryId(enquiryId);
        assertEquals(2, rows.size());
        assertTrue(rows.stream().allMatch(r -> r.getStatus() == NotificationOutboxStatus.RETRY));

        ProjectEnquiry stillPersisted = projectEnquiryRepository.findById(enquiryId).orElseThrow();
        assertEquals("NEW", stillPersisted.getStatus().name());
        assertNull(response.getBody().get("emailSent"));
    }

    @Test
    void concurrentWorkersClaimingTheSameSingleRowResultInExactlyOneSend() throws Exception {
        drainAllPending();
        reset(mailGateway);
        ProjectEnquiry enquiry = persistBareEnquiry("concurrency@example.com", "+919876510112");
        outboxRepository.save(new NotificationOutbox(enquiry.getId(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT));

        CountDownLatch startedSend = new CountDownLatch(1);
        doAnswer(invocation -> {
            startedSend.countDown();
            Thread.sleep(400); // widen the row-lock hold window so the second claim genuinely overlaps it
            return null;
        }).when(mailGateway).send(any());

        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Future<Boolean> first = pool.submit(processor::claimAndProcessOne);
            startedSend.await(2, TimeUnit.SECONDS);
            Future<Boolean> second = pool.submit(processor::claimAndProcessOne);

            boolean firstResult = first.get(5, TimeUnit.SECONDS);
            boolean secondResult = second.get(5, TimeUnit.SECONDS);

            // Exactly one of the two calls actually claimed and processed the single row; the
            // other found nothing eligible (FOR UPDATE SKIP LOCKED skipped the locked row).
            assertEquals(1, (firstResult ? 1 : 0) + (secondResult ? 1 : 0));
            verify(mailGateway, times(1)).send(any());
        } finally {
            pool.shutdown();
        }
    }

    @Test
    void flywayMigrationCreatedNotificationOutboxTableWithExpectedColumns() {
        List<String> columns = jdbcTemplate.queryForList(
                "select column_name from information_schema.columns where table_name = 'project_enquiry_notification_outbox'",
                String.class);

        for (String expected : List.of("id", "project_enquiry_id", "notification_type", "status", "attempt_count",
                "next_attempt_at", "created_at", "processing_started_at", "sent_at", "last_error_code",
                "last_error_summary", "updated_at", "version")) {
            assertTrue(columns.contains(expected), "missing expected column: " + expected);
        }
    }

    /**
     * Drains every currently-eligible outbox row (via the default, unstubbed — so
     * silently-succeeding — {@code mailGateway} mock) before a test that needs precise control
     * over exactly which row {@link NotificationOutboxProcessor#claimAndProcessOne()} picks up
     * next. Without this, PENDING rows left behind by earlier test methods in this class (which
     * share one Postgres container/table for the whole class) are just as eligible as the row
     * this test creates, and {@code claimNext()} has no per-test notion of "mine" — it will
     * happily claim whichever eligible row is oldest. Must be called before stubbing any
     * failure behaviour on {@code mailGateway} for the current test — and note the drain's own
     * (successful) {@code send()} calls stay in Mockito's invocation history, so a test that
     * asserts an exact {@code verify(mailGateway, times(n))} count afterwards must call
     * {@code reset(mailGateway)} right after draining, before it stubs anything.
     */
    private void drainAllPending() {
        while (processor.claimAndProcessOne()) {
            // keep draining
        }
    }

    /**
     * Inserts a ProjectEnquiry directly via the repository, deliberately bypassing
     * ProjectEnquiryService/LeadNotificationService so no outbox rows are auto-created — tests
     * that need to control exactly which outbox row(s) exist for an enquiry construct their own
     * afterwards.
     */
    private ProjectEnquiry persistBareEnquiry(String email, String phone) {
        String enquiryNumber = "T" + UUID.randomUUID().toString().replace("-", "").substring(0, 19);
        ProjectEnquiry enquiry = new ProjectEnquiry(
                enquiryNumber, "Test Contact", "Test Co", email, phone, phone, "India",
                ServiceType.CUSTOM_SOFTWARE, ProjectType.NEW_PRODUCT, "A bare test enquiry.", false,
                BudgetRange.FROM_2L_TO_5L, Timeline.FROM_1_TO_3_MONTHS, PreferredContactMethod.PHONE,
                "WEBSITE", "/start-project", "hashed-ip-bare", "JUnit-Agent", null, null, null, null);
        return projectEnquiryRepository.save(enquiry);
    }
}
