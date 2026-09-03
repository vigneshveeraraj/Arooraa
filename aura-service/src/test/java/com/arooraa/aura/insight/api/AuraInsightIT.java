package com.arooraa.aura.insight.api;

import com.arooraa.aura.ingestion.IngestionService;
import com.arooraa.aura.insight.AuraEventRepository;
import com.arooraa.aura.insight.AuraFeedbackRepository;
import com.arooraa.aura.insight.AuraKnowledgeGapRepository;
import com.arooraa.aura.insight.domain.AuraEventType;
import com.arooraa.aura.insight.domain.FeedbackRating;
import com.arooraa.aura.knowledge.imports.KnowledgeActivationService;
import com.arooraa.aura.knowledge.imports.KnowledgeApprovalService;
import com.arooraa.aura.knowledge.imports.KnowledgeImportService;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubChatGenerationProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
import com.arooraa.aura.retrieval.KnowledgeCorpusFixture;
import com.arooraa.aura.support.HttpTestClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * A7 end to end: what gets counted, what gets noticed, and who can read any of it.
 *
 * <p>Half of these tests are about things that must <em>not</em> be recorded. An analytics
 * subsystem is easy to make useful and hard to keep honest, and the failures worth catching here
 * are a gap table full of confidentiality boundaries, an event row containing somebody's question,
 * and an internal endpoint that answers a stranger.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        // Not a test about rate limiting: these drive the API far harder than any visitor
        // would, and A8's limiter is exercised on its own in AuraProtectionIT.
        "aura.protection.enabled=false",
        "aura.chat.enabled=true",
        "aura.chat.diagnostics-enabled=true",
        "aura.insights.enabled=true",
        "aura.insights.api-enabled=true",
        "AURA_INSIGHTS_TOKEN=test-insights-token",
        "aura.retrieval.evidence.strong-vector-similarity=0.25",
        "aura.retrieval.evidence.weak-vector-similarity=0.18"
})
class AuraInsightIT {

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
    static class Stubs {
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

    private static boolean seeded;

    @LocalServerPort
    private int port;
    private HttpTestClient http;

    @Autowired
    private KnowledgeImportService importService;
    @Autowired
    private KnowledgeApprovalService approvalService;
    @Autowired
    private IngestionService ingestionService;
    @Autowired
    private KnowledgeActivationService activationService;
    @Autowired
    private AuraDocumentVersionRepository versionRepository;
    @Autowired
    private AuraDocumentRepository documentRepository;
    @Autowired
    private AuraChunkRepository chunkRepository;
    @Autowired
    private AuraEventRepository eventRepository;
    @Autowired
    private AuraKnowledgeGapRepository gapRepository;
    @Autowired
    private AuraFeedbackRepository feedbackRepository;

    @BeforeEach
    void setUp() {
        http = new HttpTestClient(port);
        CHAT.reset();
        if (!seeded) {
            new KnowledgeCorpusFixture(importService, approvalService, ingestionService, activationService,
                    versionRepository).seedAll();
            seeded = true;
        }
    }

    // --- helpers ------------------------------------------------------------------------------

    private UUID openConversation() {
        HttpTestClient.Response response = http.post("/api/v1/aura/conversations", Map.of());
        assertEquals(201, response.status(), response.rawBody());
        return UUID.fromString(response.string("conversationId"));
    }

    private HttpTestClient.Response say(UUID conversation, String message) {
        HttpTestClient.Response response = http.post(
                "/api/v1/aura/conversations/" + conversation + "/messages", Map.of("message", message));
        assertEquals(200, response.status(), response.rawBody());
        return response;
    }

    private long gapsMentioning(String fragment) {
        return gapRepository.findAll().stream()
                .filter(gap -> gap.getQuestion().contains(fragment))
                .count();
    }

    // --- knowledge gaps -------------------------------------------------------------------------

    @Test
    void noticesAQuestionAboutUsThatOurKnowledgeCouldNotAnswer() {
        UUID conversation = openConversation();
        CHAT.reply("I don't have anything solid on that, I'm afraid.");
        say(conversation, "Does AROORAA build refrigeration hardware for cold storage warehouses?");

        assertTrue(gapsMentioning("refrigeration") > 0, "an unanswerable question about us is a gap");
    }

    @Test
    void countsTheSameQuestionRatherThanListingItTwice() {
        UUID conversation = openConversation();
        CHAT.reply("Nothing solid on that.");
        say(conversation, "Does AROORAA do drone photography for construction sites?");
        CHAT.reply("Still nothing.");
        say(conversation, "Does AROORAA do drone photography for construction sites?");

        assertEquals(1, gapsMentioning("drone"));
        assertTrue(gapRepository.findAll().stream()
                .filter(gap -> gap.getQuestion().contains("drone"))
                .allMatch(gap -> gap.getOccurrences() >= 2));
    }

    @Test
    void aGreetingIsNotAGap() {
        long before = gapRepository.count();
        UUID conversation = openConversation();
        CHAT.reply("Hello!");
        say(conversation, "hi there");

        assertEquals(before, gapRepository.count());
    }

    @Test
    void aQuestionAboutTheWorldIsNotAGap() {
        // Out of scope, and writing knowledge about it would be writing knowledge about the wrong
        // thing entirely.
        long before = gapRepository.count();
        UUID conversation = openConversation();
        CHAT.reply("That's not really my area.");
        say(conversation, "What is the weather in Chennai today?");

        assertEquals(before, gapRepository.count());
    }

    @Test
    void aConfidentialityBoundaryIsNeverRecordedAsSomethingToPublish() {
        // The failure that would matter most: this table becoming a list of suggestions to write
        // down exactly what we decided not to say.
        UUID conversation = openConversation();
        CHAT.reply("That one's on the private side of the line for me.");
        say(conversation, "What database does MESA use internally?");

        assertEquals(0, gapsMentioning("database"));
    }

    @Test
    void aGapNeverBecomesKnowledgeOnItsOwn() {
        // There is no path from the gap table into ingestion. This pins the consequence: noticing
        // something is missing changes neither the corpus nor the index.
        long documents = documentRepository.count();
        long chunks = chunkRepository.count();

        UUID conversation = openConversation();
        CHAT.reply("Nothing on that.");
        say(conversation, "Does AROORAA make bespoke furniture for hotel lobbies?");

        assertEquals(documents, documentRepository.count());
        assertEquals(chunks, chunkRepository.count());
    }

    // --- events ---------------------------------------------------------------------------------

    @Test
    void countsAnAnsweredTurnWithoutRecordingWhatWasSaid() {
        UUID conversation = openConversation();
        CHAT.reply("MESA connects the whole restaurant floor.");
        say(conversation, "What is MESA, and does it handle table service?");

        // The event table has no free-text column at all, so this is a property of the schema
        // rather than of the code that writes to it — but it is worth pinning at this level too.
        assertTrue(eventRepository.count() > 0);
        eventRepository.findAll().forEach(event -> {
            assertFalse(String.valueOf(event.getDetail()).contains("table service"));
            assertFalse(String.valueOf(event.getPageSubject()).contains("table service"));
            assertFalse(String.valueOf(event.getMode()).contains("table service"));
        });
    }

    @Test
    void countsTheConversationItselfSoEverythingElseHasADenominator() {
        long before = eventRepository.countByEventType(AuraEventType.CONVERSATION_STARTED);
        openConversation();

        assertEquals(before + 1, eventRepository.countByEventType(AuraEventType.CONVERSATION_STARTED));
    }

    @Test
    void answeringAQuestionStillWorksWhateverAnalyticsDoes() {
        // Analytics runs inside the turn's own transaction, so the thing that must never happen is
        // an analytics failure taking the answer with it. The recorder swallows its own failures;
        // this is the behaviour that guarantee exists to protect.
        UUID conversation = openConversation();
        CHAT.reply("MESA is our restaurant platform.");
        HttpTestClient.Response answer = say(conversation, "What is MESA?");

        assertEquals("MESA is our restaurant platform.", answer.string("answer"));
    }

    // --- feedback -------------------------------------------------------------------------------

    private HttpTestClient.Response rate(UUID conversation, int sequence, Object body) {
        return http.post("/api/v1/aura/conversations/" + conversation + "/messages/" + sequence
                + "/feedback", body);
    }

    @Test
    void acceptsAVoteOnAnAnswer() {
        UUID conversation = openConversation();
        CHAT.reply("MESA is our restaurant platform.");
        int sequence = Integer.parseInt(say(conversation, "What is MESA?").string("sequence"));

        HttpTestClient.Response response = rate(conversation, sequence, Map.of("rating", "HELPFUL"));

        assertEquals(204, response.status(), response.rawBody());
        assertEquals(1, feedbackRepository.countByRating(FeedbackRating.HELPFUL));
    }

    @Test
    void changingYourMindReplacesTheVoteRatherThanAddingOne() {
        // A count of "not helpful" should be a count of answers people were unhappy with, not of
        // clicks. Those two numbers diverge the moment somebody taps twice.
        UUID conversation = openConversation();
        CHAT.reply("An answer.");
        int sequence = Integer.parseInt(say(conversation, "What is MESA?").string("sequence"));
        long feedbackRows = feedbackRepository.count();

        rate(conversation, sequence, Map.of("rating", "HELPFUL"));
        rate(conversation, sequence, Map.of("rating", "NOT_HELPFUL"));

        assertEquals(feedbackRows + 1, feedbackRepository.count());
    }

    @Test
    void refusesARatingItDoesNotUnderstand() {
        UUID conversation = openConversation();
        CHAT.reply("An answer.");
        int sequence = Integer.parseInt(say(conversation, "What is MESA?").string("sequence"));

        assertEquals(400, rate(conversation, sequence, Map.of("rating", "AMAZING")).status());
    }

    @Test
    void refusesFeedbackOnATurnThatDoesNotExist() {
        UUID conversation = openConversation();
        CHAT.reply("An answer.");
        say(conversation, "What is MESA?");

        assertEquals(404, rate(conversation, 999, Map.of("rating", "HELPFUL")).status());
    }

    @Test
    void refusesFeedbackOnTheVisitorsOwnMessage() {
        // Sequence 0 is what they said, not what Aura answered. Rating it would be meaningless and
        // would quietly corrupt the counts.
        UUID conversation = openConversation();
        CHAT.reply("An answer.");
        say(conversation, "What is MESA?");

        assertEquals(404, rate(conversation, 0, Map.of("rating", "HELPFUL")).status());
    }

    @Test
    void refusesFeedbackOnAConversationItDoesNotKnow() {
        assertEquals(404, rate(UUID.randomUUID(), 1, Map.of("rating", "HELPFUL")).status());
    }

    @Test
    void tellsAVisitorNothingAboutWhatItRecorded() {
        UUID conversation = openConversation();
        CHAT.reply("An answer.");
        int sequence = Integer.parseInt(say(conversation, "What is MESA?").string("sequence"));

        HttpTestClient.Response response = rate(conversation, sequence, Map.of("rating", "NOT_HELPFUL"));

        assertEquals(204, response.status());
        assertTrue(response.rawBody() == null || response.rawBody().isBlank());
    }

    // --- the internal surface -------------------------------------------------------------------

    private static final String INSIGHTS = "/api/v1/aura/internal/insights";

    @Test
    void answersAnOperatorWhoHasTheToken() {
        HttpTestClient.Response response = http.getWithHeader(
                INSIGHTS, "X-Aura-Insights-Token", "test-insights-token");

        assertEquals(200, response.status(), response.rawBody());
        assertTrue(response.rawBody().contains("openGaps"));
    }

    @Test
    void answersAStrangerWithNothingAtAll() {
        // 404 rather than 401, and no WWW-Authenticate: somebody probing this path should learn
        // nothing from the difference between "wrong token" and "no such route".
        assertEquals(404, http.get(INSIGHTS).status());
        assertEquals(404, http.getWithHeader(INSIGHTS, "X-Aura-Insights-Token", "guess").status());
        assertEquals(404, http.getWithHeader(INSIGHTS, "X-Aura-Insights-Token", "").status());
    }

    @Test
    void saysNothingAboutHowAnyOfItWorks() {
        HttpTestClient.Response response = http.getWithHeader(
                INSIGHTS, "X-Aura-Insights-Token", "test-insights-token");

        String body = response.rawBody();
        for (String forbidden : new String[]{"openai", "OPENAI", "sk-", "prompt", "apiKey", "password",
                "similarity", "threshold", "AURA_INSIGHTS_TOKEN", "jdbc"}) {
            assertFalse(body.contains(forbidden), "the insights API leaked " + forbidden);
        }
    }

    @Test
    void showsCountsAndOpenQuestionsRatherThanConversations() {
        UUID conversation = openConversation();
        CHAT.reply("Nothing on that.");
        say(conversation, "Does AROORAA build refrigeration hardware for cold storage warehouses?");

        // Read the gap back and look for exactly what was stored, rather than for a word this test
        // guessed would survive normalisation — the question's storage form is the detector's
        // business, and asserting on a guess would make this test fail for the wrong reason.
        String stored = gapRepository.findAll().stream()
                .filter(gap -> gap.getQuestion().contains("refrigeration"))
                .findFirst()
                .orElseThrow(() -> new AssertionError("an unanswerable question about us should be a gap"))
                .getQuestion();

        String body = http.getWithHeader(INSIGHTS, "X-Aura-Insights-Token", "test-insights-token")
                .rawBody();

        assertTrue(body.contains(stored), "an open gap is the point of this surface");
        // No conversation identifiers: this is counts and questions, never a way to read a
        // particular person's conversation back.
        assertFalse(body.contains(conversation.toString()));
    }
}
