package com.arooraa.aura.conversation.api;

import com.arooraa.aura.conversation.ConversationOrchestrator;
import com.arooraa.aura.conversation.domain.AuraMessage;
import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubChatGenerationProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
import com.arooraa.aura.support.HttpTestClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
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
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Does Aura mangle text, or does the Windows console just draw it badly?
 *
 * <p>The A3.2 report showed {@code "Hey there! How can I help you today? ?"} in a real-provider log,
 * with a {@code ?} where an emoji should have been. That single character has two very different
 * explanations — a broken encoding boundary somewhere in HTTP or storage, or a terminal that cannot
 * draw what it was handed — and they call for opposite responses, so this settles it by measuring
 * instead of reasoning.
 *
 * <p>The path measured is the one a real message takes: JSON request body → controller → JPA →
 * Postgres → JPA → JSON response body, compared by code point at both ends and by
 * {@code length()}/{@code octet_length()} inside the database itself. Nothing here goes near a log
 * or a terminal, which is the point — if these pass, every layer the product owns is clean and the
 * {@code ?} was drawn, not stored.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        // Not a test about rate limiting: these drive the API far harder than any visitor
        // would, and A8's limiter is exercised on its own in AuraProtectionIT.
        "aura.protection.enabled=false",
        "aura.chat.enabled=true",
        "aura.chat.diagnostics-enabled=true"
})
class UnicodeRoundTripIT {

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

    static final StubChatGenerationProvider CHAT = new StubChatGenerationProvider();

    @TestConfiguration
    static class StubProviders {
        @Bean
        @Primary
        EmbeddingProvider stubEmbeddingProvider() {
            return new StubEmbeddingProvider();
        }

        @Bean
        @Primary
        ChatGenerationProvider stubChatGenerationProvider() {
            return CHAT;
        }
    }

    // Built from code points on purpose, rather than typed as literal characters. Literals would
    // make this file's own encoding — and the compiler's reading of it — part of what is under
    // test, and a test that mangles its expectation the same way it mangles its input passes while
    // proving nothing. Numbers cannot be mis-decoded, so what is asserted below is exactly these
    // code points and nothing else.

    private static String of(int... codePoints) {
        return new String(codePoints, 0, codePoints.length);
    }

    /** U+1F604 grinning face — supplementary plane, so one char is not one code point. */
    private static final String EMOJI = of(0x1F604);
    private static final String EN_DASH = of(0x2013);
    private static final String EM_DASH = of(0x2014);
    /** U+2019, the one a word processor substitutes for a typed apostrophe. */
    private static final String CURLY_APOSTROPHE = of(0x2019);
    /** Tamil "vanakkam" (hello), ending in the pulli — a combining mark. */
    private static final String TAMIL_HELLO = of(0x0BB5, 0x0BA3, 0x0B95, 0x0BCD, 0x0B95, 0x0BAE, 0x0BCD);
    /** Tamil "enakku oru idea irukku" — Tamil script and Latin in one string, the way people write. */
    private static final String TAMIL_SENTENCE = of(
            0x0B8E, 0x0BA9, 0x0B95, 0x0BCD, 0x0B95, 0x0BC1, ' ',
            0x0B92, 0x0BB0, 0x0BC1, ' ', 'i', 'd', 'e', 'a', ' ',
            0x0B87, 0x0BB0, 0x0BC1, 0x0B95, 0x0BCD, 0x0B95, 0x0BC1);
    /** U+0BCD, the pulli — the first casualty of a careless normalization. */
    private static final char TAMIL_PULLI = 0x0BCD;
    /** U+FFFD, what a decoder writes when it gives up. Must never appear anywhere. */
    private static final String REPLACEMENT_CHARACTER = of(0xFFFD);

    private static final List<String> SAMPLES = List.of(
            EMOJI,
            "Hey there! How can I help you today? " + EMOJI,
            TAMIL_HELLO,
            TAMIL_SENTENCE,
            "range " + EN_DASH + " dash",
            "an aside " + EM_DASH + " like this",
            "it" + CURLY_APOSTROPHE + "s the visitor" + CURLY_APOSTROPHE + "s idea",
            TAMIL_HELLO + " " + EM_DASH + " naan MESA pathi kekanum " + EMOJI);

    @LocalServerPort
    private int port;
    private HttpTestClient http;

    @Autowired
    private ConversationOrchestrator orchestrator;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        http = new HttpTestClient(port);
        CHAT.reset();
    }

    @Test
    void everySampleSurvivesTheApiAndTheDatabaseUnchanged() {
        UUID conversation = openConversation();

        for (String sample : SAMPLES) {
            HttpTestClient.Response response = http.post(
                    "/api/v1/aura/conversations/" + conversation + "/messages", Map.of("message", sample));
            assertEquals(200, response.status(), response.rawBody());
        }

        List<AuraMessage> transcript = orchestrator.transcript(conversation);
        for (int i = 0; i < SAMPLES.size(); i++) {
            String expected = SAMPLES.get(i);
            String stored = transcript.get(i * 2).getContent();

            assertEquals(expected, stored, "stored text differs from what was sent");
            assertEquals(expected.codePointCount(0, expected.length()),
                    stored.codePointCount(0, stored.length()),
                    "the code point count changed, which means characters were substituted");
            assertFalse(stored.contains(REPLACEMENT_CHARACTER),
                    "a decoder gave up somewhere on the way in");
        }
    }

    @Test
    void whatTheApiReadsBackIsCodePointForCodePointWhatWasSent() {
        UUID conversation = openConversation();
        String sample = SAMPLES.get(SAMPLES.size() - 1);

        http.post("/api/v1/aura/conversations/" + conversation + "/messages", Map.of("message", sample));

        HttpTestClient.Response transcript = http.get("/api/v1/aura/conversations/" + conversation);
        assertEquals(200, transcript.status());
        String returned = String.valueOf(transcript.list("messages").get(0).get("content"));

        assertEquals(sample, returned);
        int[] sent = sample.codePoints().toArray();
        int[] read = returned.codePoints().toArray();
        assertEquals(sent.length, read.length, "code point count differs on the way out");
        for (int i = 0; i < sent.length; i++) {
            assertEquals(sent[i], read[i], "code point " + i + " differs on the way out");
        }
    }

    @Test
    void anAnswerContainingEmojiAndTamilReachesTheVisitorIntact() {
        // The other direction: text a model produced, through the guardrail and out over HTTP.
        UUID conversation = openConversation();
        String reply = TAMIL_HELLO + "! Sollunga " + EM_DASH + " " + TAMIL_SENTENCE + " " + EMOJI;
        CHAT.reply(reply);

        HttpTestClient.Response response = http.post(
                "/api/v1/aura/conversations/" + conversation + "/messages", Map.of("message", "Vanakkam"));

        assertEquals(200, response.status());
        assertEquals(reply, response.string("answer"));
        assertEquals(reply, orchestrator.transcript(conversation).get(1).getContent(),
                "and the same text is what was written to the transcript");
    }

    @Test
    void postgresItselfIsHoldingTheCharactersRatherThanTheirReplacements() {
        // Measured on the database side, not in Java. length() counts characters and
        // octet_length() counts bytes, so a string that is genuinely stored as UTF-8 must be
        // strictly wider in bytes than in characters — a substituted '?' or '�' would not be.
        UUID conversation = openConversation();
        String sample = EMOJI + " " + TAMIL_HELLO + " " + EM_DASH + " it" + CURLY_APOSTROPHE + "s fine";

        http.post("/api/v1/aura/conversations/" + conversation + "/messages", Map.of("message", sample));
        AuraMessage stored = orchestrator.transcript(conversation).get(0);

        Integer characters = jdbcTemplate.queryForObject(
                "SELECT length(content) FROM aura_messages WHERE id = ?", Integer.class, stored.getId());
        Integer bytes = jdbcTemplate.queryForObject(
                "SELECT octet_length(content) FROM aura_messages WHERE id = ?", Integer.class, stored.getId());
        String fromSql = jdbcTemplate.queryForObject(
                "SELECT content FROM aura_messages WHERE id = ?", String.class, stored.getId());

        assertEquals(sample.codePointCount(0, sample.length()), characters,
                "Postgres counts a different number of characters than were sent");
        assertTrue(bytes > characters, "multi-byte characters were flattened to single bytes somewhere");
        assertEquals(sample, fromSql, "read straight back out of SQL, bypassing the entity mapping");
        assertTrue(fromSql.codePoints().anyMatch(codePoint -> codePoint > 0xFFFF),
                "the supplementary-plane emoji survived");
        assertTrue(fromSql.indexOf(TAMIL_PULLI) >= 0, "the Tamil combining mark survived");
    }

    @Test
    void theEnDashEmDashAndCurlyApostropheAreNotQuietlyNormalized() {
        // These three are the ones that survive Windows-1252 and die in anything narrower, which is
        // what makes them worth asserting separately: they are the characters most likely to be
        // silently "helpfully" replaced by a straight quote or hyphen along the way.
        UUID conversation = openConversation();
        String sample = "2019" + EN_DASH + "2026, the client" + CURLY_APOSTROPHE + "s call " + EM_DASH + " not ours";

        http.post("/api/v1/aura/conversations/" + conversation + "/messages", Map.of("message", sample));
        String stored = orchestrator.transcript(conversation).get(0).getContent();

        assertEquals(sample, stored);
        assertTrue(stored.contains(EN_DASH), "en dash");
        assertTrue(stored.contains(EM_DASH), "em dash");
        assertTrue(stored.contains(CURLY_APOSTROPHE), "curly apostrophe");
        assertFalse(stored.contains("-"), "nothing was downgraded to a plain hyphen");
        assertFalse(stored.contains("'"), "nothing was downgraded to a straight apostrophe");
    }

    private UUID openConversation() {
        HttpTestClient.Response response = http.post("/api/v1/aura/conversations", Map.of());
        assertEquals(201, response.status(), response.rawBody());
        return UUID.fromString(response.string("conversationId"));
    }
}
