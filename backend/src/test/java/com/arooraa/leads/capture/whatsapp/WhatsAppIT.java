package com.arooraa.leads.capture.whatsapp;

import com.arooraa.leads.capture.conversation.LeadConversationService;
import com.arooraa.leads.capture.conversation.LeadConversationService.InboundMessage;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.Accepted;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.RetryableNotAccepted;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.Unknown;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
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
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static com.arooraa.leads.capture.whatsapp.WhatsAppFixtures.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * WhatsApp transport against a real PostgreSQL (V12 migration, constraints, row locks, SKIP LOCKED,
 * advisory locks) through the real security chain. The gateway is a Mockito bean — no test here can
 * reach Meta or any network. The scheduled worker is off; tests drive the processor and dispatcher.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class WhatsAppIT {

    @Container
    static PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withStartupTimeout(Duration.ofMinutes(5))
            .withDatabaseName("arooraa_leads")
            .withUsername("arooraa_leads_app")
            .withPassword("integration-test-password");

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("arooraa.ip-hash-secret", () -> "integration-test-secret");
        registry.add("arooraa.lead-assistant.model.provider", () -> "none");
        registry.add("arooraa.contact-notifications.enabled", () -> false);
        registry.add("arooraa.whatsapp.enabled", () -> true);
        registry.add("arooraa.whatsapp.outbound-enabled", () -> true);
        registry.add("arooraa.whatsapp.worker.enabled", () -> false);
        registry.add("arooraa.whatsapp.app-secret", () -> APP_SECRET);
        registry.add("arooraa.whatsapp.verify-token", () -> VERIFY_TOKEN);
        registry.add("arooraa.whatsapp.access-token", () -> ACCESS_TOKEN);
        registry.add("arooraa.whatsapp.phone-number-id", () -> PHONE_NUMBER_ID);
        registry.add("arooraa.whatsapp.business-account-id", () -> WABA_ID);
        registry.add("arooraa.whatsapp.api-version", () -> API_VERSION);
    }

    @LocalServerPort
    int port;
    @Autowired
    TestRestTemplate rest;
    @Autowired
    JdbcTemplate jdbc;
    @Autowired
    WhatsAppInboundProcessor processor;
    @Autowired
    WhatsAppOutboundDispatcher dispatcher;
    @MockitoBean
    WhatsAppGateway gateway;
    @MockitoSpyBean
    LeadConversationService conversationService;

    @BeforeEach
    void isolate() {
        jdbc.update("DELETE FROM whatsapp_outbound_messages");
        jdbc.update("DELETE FROM whatsapp_inbound_messages");
        when(gateway.sendText(any(), anyString(), anyString()))
                .thenAnswer(i -> new Accepted("wamid.OUT." + UUID.randomUUID()));
    }

    private ResponseEntity<String> post(String body, boolean signed) {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (signed) {
            headers.set("X-Hub-Signature-256", sign(bytes));
        }
        return rest.exchange("http://localhost:" + port + "/api/v1/whatsapp/webhook", HttpMethod.POST,
                new HttpEntity<>(bytes, headers), String.class);
    }

    private int count(String sql, Object... args) {
        return jdbc.queryForObject(sql, Integer.class, args);
    }

    private int drainInbound() {
        int n = 0;
        while (processor.processOne()) n++;
        return n;
    }

    private List<Map<String, Object>> outboundFor(String digits) {
        return jdbc.queryForList("SELECT * FROM whatsapp_outbound_messages WHERE recipient_digits = ? ORDER BY seq", digits);
    }

    @Test
    void realSecurityChainVerifiesChallengeAndRejectsBadPostsWithoutWrites() {
        ResponseEntity<String> challenge = rest.getForEntity("http://localhost:" + port
                + "/api/v1/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=" + VERIFY_TOKEN + "&hub.challenge=42", String.class);
        assertEquals(HttpStatus.OK, challenge.getStatusCode());
        assertEquals("42", challenge.getBody());

        String body = text("wamid.SEC1", "919840070001", "Hello", Instant.now());
        assertEquals(HttpStatus.UNAUTHORIZED, post(body, false).getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, rest.exchange("http://localhost:" + port + "/api/v1/whatsapp/webhook",
                HttpMethod.POST, new HttpEntity<>(body.replace("Hello", "Hellx").getBytes(StandardCharsets.UTF_8),
                        headersSignedWith(sign(body))), String.class).getStatusCode());
        assertEquals(HttpStatus.valueOf(413), post(" ".repeat(WhatsAppWebhookController.MAX_BODY_BYTES + 1), true).getStatusCode());
        assertEquals(HttpStatus.OK, post(envelope("999999999999", PHONE_NUMBER_ID, "\"messages\":[]"), true).getStatusCode());
        String invalidSibling = message(
                "{\"from\":\"919840070001\",\"id\":\"wamid.SEC2\",\"timestamp\":\"" + Instant.now().getEpochSecond()
                        + "\",\"type\":\"text\",\"text\":{\"body\":\"ok\"}}",
                "{\"from\":\"0000\",\"id\":\"wamid.SEC3\",\"timestamp\":\"1\",\"type\":\"text\",\"text\":{\"body\":\"bad\"}}");
        assertEquals(HttpStatus.BAD_REQUEST, post(invalidSibling, true).getStatusCode());
        assertEquals(0, count("SELECT count(*) FROM whatsapp_inbound_messages"));
        // Only the exact path is public: a sub-path is not permitted by the security chain.
        assertFalse(rest.getForEntity("http://localhost:" + port + "/api/v1/whatsapp/webhook/extra", String.class)
                .getStatusCode().is2xxSuccessful());
    }

    private static HttpHeaders headersSignedWith(String signature) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Hub-Signature-256", signature);
        return headers;
    }

    @Test
    void signedTamilMessageIsStoredFirstThenProcessedAndSentWithCorrelationId() {
        String digits = "919840070002";
        assertEquals(HttpStatus.OK, post(text("wamid.TA.1", digits, "வணக்கம், எனக்கு இணையதளம் வேண்டும்", Instant.now()), true)
                .getStatusCode());
        assertEquals("PENDING", jdbc.queryForObject(
                "SELECT status FROM whatsapp_inbound_messages WHERE wamid = 'wamid.TA.1'", String.class));
        assertEquals(0, count("SELECT count(*) FROM lead_conversation_messages WHERE external_message_id = 'wamid.TA.1'"),
                "no conversation work inside the webhook request");

        assertEquals(1, drainInbound());
        assertEquals(1, count("SELECT count(*) FROM lead_conversation_messages WHERE external_message_id = 'wamid.TA.1'"));
        List<Map<String, Object>> out = outboundFor(digits);
        assertFalse(out.isEmpty());
        UUID id = (UUID) out.getFirst().get("id");

        when(gateway.sendText(any(), anyString(), anyString())).thenReturn(new Accepted("wamid.OUT.TA1"));
        assertTrue(dispatcher.dispatchOne());
        verify(gateway).sendText(Mockito.eq(id), Mockito.eq(digits), anyString());
        Map<String, Object> row = jdbc.queryForMap("SELECT * FROM whatsapp_outbound_messages WHERE id = ?", id);
        assertEquals("ACCEPTED", row.get("status"));
        assertEquals("wamid.OUT.TA1", row.get("meta_message_id"));
        assertEquals(1, row.get("attempt_count"));
    }

    @Test
    void concurrentDuplicateDeliveriesAreAll200AndCreateOneTurnAndAlteredReplayNeverOverwrites() throws Exception {
        String digits = "919840070003";
        String body = text("wamid.DUP.1", digits, "Hi AROORAA", Instant.now());
        ExecutorService pool = Executors.newFixedThreadPool(8);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<HttpStatus>> results = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            results.add(pool.submit(() -> {
                start.await();
                return HttpStatus.valueOf(post(body, true).getStatusCode().value());
            }));
        }
        start.countDown();
        for (Future<HttpStatus> f : results) assertEquals(HttpStatus.OK, f.get());
        pool.shutdown();

        assertEquals(HttpStatus.OK, post(text("wamid.DUP.1", digits, "ALTERED", Instant.now()), true).getStatusCode());
        assertEquals(1, count("SELECT count(*) FROM whatsapp_inbound_messages WHERE wamid = 'wamid.DUP.1'"));
        assertEquals("Hi AROORAA", jdbc.queryForObject(
                "SELECT body FROM whatsapp_inbound_messages WHERE wamid = 'wamid.DUP.1'", String.class));

        assertEquals(1, drainInbound());
        int outbound = outboundFor(digits).size();
        assertEquals(HttpStatus.OK, post(body, true).getStatusCode());
        assertEquals(0, drainInbound());
        assertEquals(outbound, outboundFor(digits).size());
        assertEquals(1, count("SELECT count(*) FROM lead_conversation_messages WHERE external_message_id = 'wamid.DUP.1'"));
    }

    @Test
    void concurrentProcessorsSerialiseANewParticipantInSourceOrder() throws Exception {
        String digits = "919840070004";
        Instant t = Instant.now().minusSeconds(30);
        // Arrives second but was sent first: must still be handled first.
        assertEquals(HttpStatus.OK, post(text("wamid.RACE.2", digits, "1", t.plusSeconds(1)), true).getStatusCode());
        assertEquals(HttpStatus.OK, post(text("wamid.RACE.1", digits, "Hello", t), true).getStatusCode());

        ExecutorService pool = Executors.newFixedThreadPool(4);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Integer>> workers = new ArrayList<>();
        Callable<Integer> drain = () -> {
            start.await();
            return drainInbound();
        };
        for (int i = 0; i < 4; i++) workers.add(pool.submit(drain));
        start.countDown();
        int processed = 0;
        for (Future<Integer> f : workers) processed += f.get();
        pool.shutdown();
        processed += drainInbound();

        assertEquals(2, processed);
        assertEquals(0, count("SELECT count(*) FROM whatsapp_inbound_messages WHERE status <> 'PROCESSED'"));
        assertEquals(1, count("SELECT count(*) FROM lead_captures WHERE phone = ?", "+" + digits));
        String hash = jdbc.queryForObject(
                "SELECT participant_hash FROM whatsapp_inbound_messages WHERE wamid = 'wamid.RACE.1'", String.class);
        assertEquals(1, count("SELECT count(*) FROM lead_conversations WHERE channel = 'WHATSAPP' AND participant_hash = ?", hash));
        List<String> inboundOrder = jdbc.queryForList("""
                SELECT m.external_message_id FROM lead_conversation_messages m
                JOIN lead_conversations c ON c.id = m.conversation_id
                WHERE c.participant_hash = ? AND m.direction = 'INBOUND' ORDER BY m.created_at
                """, String.class, hash);
        assertEquals(List.of("wamid.RACE.1", "wamid.RACE.2"), inboundOrder);
    }

    @Test
    void aFailedTurnRollsBackEverythingAndIsNotOvertakenByANewerMessage() {
        String digits = "919840070005";
        Instant t = Instant.now().minusSeconds(30);
        post(text("wamid.RB.1", digits, "Hello", t), true);
        post(text("wamid.RB.2", digits, "1", t.plusSeconds(1)), true);
        doAnswer(i -> {
            Object result = i.callRealMethod();
            if ("wamid.RB.1".equals(i.<InboundMessage>getArgument(0).externalMessageId())) {
                throw new IllegalStateException("simulated failure after the turn was written");
            }
            return result;
        }).when(conversationService).handle(any());

        assertTrue(processor.processOne());
        Map<String, Object> failed = jdbc.queryForMap("SELECT * FROM whatsapp_inbound_messages WHERE wamid = 'wamid.RB.1'");
        assertEquals("RETRY", failed.get("status"));
        assertEquals(1, failed.get("attempt_count"));
        assertEquals("IllegalStateException", failed.get("last_error_code"));
        assertEquals(0, count("SELECT count(*) FROM lead_conversation_messages WHERE external_message_id = 'wamid.RB.1'"));
        assertEquals(0, count("SELECT count(*) FROM lead_captures WHERE phone = ?", "+" + digits));
        assertEquals(0, outboundFor(digits).size());

        assertFalse(processor.processOne(), "the newer message must wait for the failed older one");
        assertEquals("PENDING", jdbc.queryForObject(
                "SELECT status FROM whatsapp_inbound_messages WHERE wamid = 'wamid.RB.2'", String.class));

        for (int attempt = 2; attempt <= WhatsAppInboundProcessor.MAX_ATTEMPTS; attempt++) {
            jdbc.update("UPDATE whatsapp_inbound_messages SET next_attempt_at = now() WHERE wamid = 'wamid.RB.1'");
            assertTrue(processor.processOne());
        }
        assertEquals("DEAD", jdbc.queryForObject(
                "SELECT status FROM whatsapp_inbound_messages WHERE wamid = 'wamid.RB.1'", String.class));

        Mockito.reset(conversationService);
        assertTrue(processor.processOne(), "a DEAD row no longer blocks the participant");
        assertEquals("PROCESSED", jdbc.queryForObject(
                "SELECT status FROM whatsapp_inbound_messages WHERE wamid = 'wamid.RB.2'", String.class));
    }

    @Test
    void unknownOutcomeAndStaleLeaseBecomeUnknownAndAreNeverResent() {
        String digits = "919840070006";
        post(text("wamid.UNK.1", digits, "Hello", Instant.now()), true);
        drainInbound();
        UUID id = (UUID) outboundFor(digits).getFirst().get("id");

        when(gateway.sendText(any(), anyString(), anyString())).thenAnswer(i -> {
            assertEquals("SENDING", jdbc.queryForObject(
                    "SELECT status FROM whatsapp_outbound_messages WHERE id = ?", String.class, id),
                    "SENDING must be committed before the network call");
            return new Unknown("TIMEOUT");
        });
        assertTrue(dispatcher.dispatchOne());
        assertEquals("UNKNOWN", jdbc.queryForObject("SELECT status FROM whatsapp_outbound_messages WHERE id = ?", String.class, id));
        assertFalse(dispatcher.dispatchOne());
        verify(gateway, times(1)).sendText(any(), anyString(), anyString());

        // Simulated crash after the claim: SENDING with an old lease.
        String other = "919840070007";
        post(text("wamid.UNK.2", other, "Hello", Instant.now()), true);
        drainInbound();
        UUID crashed = (UUID) outboundFor(other).getFirst().get("id");
        jdbc.update("""
                UPDATE whatsapp_outbound_messages SET status = 'SENDING', attempt_count = 1, lease_token = gen_random_uuid(),
                    claimed_at = now() - interval '1 hour' WHERE id = ?
                """, crashed);
        assertEquals(1, dispatcher.recoverStaleSending());
        Map<String, Object> row = jdbc.queryForMap("SELECT * FROM whatsapp_outbound_messages WHERE id = ?", crashed);
        assertEquals("UNKNOWN", row.get("status"));
        assertEquals("LEASE_EXPIRED", row.get("last_error_code"));
        assertFalse(dispatcher.dispatchOne());
        verify(gateway, never()).sendText(Mockito.eq(crashed), anyString(), anyString());
    }

    @Test
    void deliveryStatusBeforeSendResponseReconcilesByCorrelationIdAndStaysMonotonic() {
        String digits = "919840070008";
        post(text("wamid.SBR.1", digits, "Hello", Instant.now()), true);
        drainInbound();
        UUID id = (UUID) outboundFor(digits).getFirst().get("id");

        when(gateway.sendText(any(), anyString(), anyString())).thenAnswer(i -> {
            assertEquals(HttpStatus.OK, post(WhatsAppFixtures.status("wamid.OUT.SBR", digits, "delivered",
                    i.getArgument(0).toString(), Instant.now()), true).getStatusCode());
            return new Accepted("wamid.OUT.SBR");
        });
        assertTrue(dispatcher.dispatchOne());
        Map<String, Object> row = jdbc.queryForMap("SELECT * FROM whatsapp_outbound_messages WHERE id = ?", id);
        assertEquals("ACCEPTED", row.get("status"));
        assertEquals("delivered", row.get("delivery_status"));
        assertEquals("wamid.OUT.SBR", row.get("meta_message_id"));

        post(WhatsAppFixtures.status("wamid.OUT.SBR", digits, "sent", null, Instant.now()), true);
        assertEquals("delivered", deliveryStatus(id), "never moves backwards");
        post(WhatsAppFixtures.status("wamid.OUT.SBR", "919840079999", "failed", id.toString(), Instant.now()), true);
        assertEquals("delivered", deliveryStatus(id), "a different recipient never matches");
        post(WhatsAppFixtures.status("wamid.OTHER", digits, "read", UUID.randomUUID().toString(), Instant.now()), true);
        assertEquals("delivered", deliveryStatus(id), "an arbitrary callback id never matches");
        post(WhatsAppFixtures.status("wamid.OUT.SBR", digits, "read", null, Instant.now()), true);
        assertEquals("read", deliveryStatus(id));
        verify(gateway, times(1)).sendText(any(), anyString(), anyString());
    }

    @Test
    void signedWebhooksCompleteTheConversationInBothChosenLanguages() {
        for (String language : List.of("en", "ta")) {
            String digits = language.equals("en") ? "919840070011" : "919840070012";
            List<String> inputs = List.of("Hello", language.equals("en") ? "1" : "2",
                    "1", "Textile shop", "evening");
            Instant sentAt = Instant.now().minusSeconds(20);
            for (int turn = 0; turn < inputs.size(); turn++) {
                assertEquals(HttpStatus.OK, post(text("wamid.LANG." + language + "." + turn,
                        digits, inputs.get(turn), sentAt.plusSeconds(turn)), true).getStatusCode());
                assertEquals(1, drainInbound());
            }
            Map<String, Object> lead = jdbc.queryForMap(
                    "SELECT preferred_language, requirement, business_type, preferred_call_time "
                            + "FROM lead_captures WHERE phone = ?", "+" + digits);
            assertEquals(language, lead.get("preferred_language"));
            assertEquals("WEBSITE", lead.get("requirement"));
            assertEquals("Textile shop", lead.get("business_type"));
            assertEquals("EVENING", lead.get("preferred_call_time"));
            List<Map<String, Object>> replies = outboundFor(digits);
            assertTrue(replies.getLast().get("body").toString()
                    .startsWith(language.equals("en") ? "Thank you!" : "நன்றி"));
        }
    }

    private String deliveryStatus(UUID id) {
        return jdbc.queryForObject("SELECT delivery_status FROM whatsapp_outbound_messages WHERE id = ?", String.class, id);
    }

    @Test
    void repliesOutsideTheTwentyFourHourWindowArePermanentlyBlocked() {
        String digits = "919840070009";
        // A late (re)delivery of a 25h-old message: the window is anchored on Meta's timestamp, not arrival.
        post(text("wamid.WIN.1", digits, "Hello", Instant.now().minus(Duration.ofHours(25))), true);
        drainInbound();
        UUID id = (UUID) outboundFor(digits).getFirst().get("id");

        assertTrue(dispatcher.dispatchOne());
        assertEquals("EXPIRED", jdbc.queryForObject("SELECT status FROM whatsapp_outbound_messages WHERE id = ?", String.class, id));
        assertFalse(dispatcher.dispatchOne());
        verify(gateway, never()).sendText(any(), anyString(), anyString());
    }

    @Test
    void throttledSendsRetryBoundedAndInOrderBeforeLaterRepliesGo() {
        String digits = "919840070010";
        Instant t = Instant.now().minusSeconds(30);
        post(text("wamid.ORD.1", digits, "Hello", t), true);
        post(text("wamid.ORD.2", digits, "1", t.plusSeconds(1)), true);
        assertEquals(2, drainInbound());
        List<Map<String, Object>> out = outboundFor(digits);
        assertTrue(out.size() >= 2);
        UUID first = (UUID) out.get(0).get("id");
        UUID second = (UUID) out.get(1).get("id");

        List<UUID> calls = Collections.synchronizedList(new ArrayList<>());
        when(gateway.sendText(any(), anyString(), anyString())).thenAnswer(i -> {
            UUID id = i.getArgument(0);
            calls.add(id);
            return id.equals(first) ? new RetryableNotAccepted("HTTP_429", Duration.ofDays(1))
                    : new Accepted("wamid.OUT." + UUID.randomUUID());
        });

        assertTrue(dispatcher.dispatchOne());
        Map<String, Object> row = jdbc.queryForMap("SELECT * FROM whatsapp_outbound_messages WHERE id = ?", first);
        assertEquals("RETRY", row.get("status"));
        Instant next = ((java.sql.Timestamp) row.get("next_attempt_at")).toInstant();
        assertTrue(next.isBefore(Instant.now().plus(Duration.ofMinutes(5)).plusSeconds(5)), "Retry-After is bounded");
        assertFalse(dispatcher.dispatchOne(), "the later reply must not overtake the throttled one");

        for (int i = 0; i < 2; i++) {
            jdbc.update("UPDATE whatsapp_outbound_messages SET next_attempt_at = now() WHERE id = ?", first);
            assertTrue(dispatcher.dispatchOne());
        }
        assertEquals("FAILED", jdbc.queryForObject("SELECT status FROM whatsapp_outbound_messages WHERE id = ?", String.class, first));
        assertEquals(3, count("SELECT attempt_count FROM whatsapp_outbound_messages WHERE id = ?", first));

        assertTrue(dispatcher.dispatchOne());
        assertEquals(List.of(first, first, first, second), calls.subList(0, 4));
        assertEquals("ACCEPTED", jdbc.queryForObject("SELECT status FROM whatsapp_outbound_messages WHERE id = ?", String.class, second));
        assertNull(jdbc.queryForObject("SELECT delivery_status FROM whatsapp_outbound_messages WHERE id = ?", String.class, second));
    }
}
