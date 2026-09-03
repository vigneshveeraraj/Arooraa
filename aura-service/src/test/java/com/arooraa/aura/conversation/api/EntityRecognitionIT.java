package com.arooraa.aura.conversation.api;

import com.arooraa.aura.ingestion.IngestionService;
import com.arooraa.aura.knowledge.imports.KnowledgeActivationService;
import com.arooraa.aura.knowledge.imports.KnowledgeApprovalService;
import com.arooraa.aura.knowledge.imports.KnowledgeImportService;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.ChatMessage;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * A5.2 owner finding 1, end to end: a visitor says MESA, speech-to-text returns Meesa, and the
 * question has to reach the same grounded answer it would have reached if the microphone had heard
 * it properly.
 *
 * <p>Exercised through real HTTP, real Postgres/pgvector and the same seeded corpus the rest of the
 * chat suite uses, because the claim being made is about the whole pipeline rather than about the
 * resolver: recognition happens early enough to change the routing decision, and everything after
 * it — the confidentiality boundary, retrieval, the evidence gate, the guardrail — still runs
 * exactly as before. {@code PublicEntityResolverTest} covers the vocabulary itself.
 *
 * <h2>EVIDENCE THRESHOLDS</h2>
 * Rescaled exactly as {@code PageAwarenessIT} rescales them, for the same reason and to the same
 * numbers: {@code StubEmbeddingProvider}'s bag-of-words similarities have nothing like a real
 * model's scale, and these queries are the same "Tell me about {@code <subject>}" shape that class
 * measured against this corpus.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        // Not a test about rate limiting: these drive the API far harder than any visitor
        // would, and A8's limiter is exercised on its own in AuraProtectionIT.
        "aura.protection.enabled=false",
        "aura.chat.enabled=true",
        "aura.chat.diagnostics-enabled=true",
        "aura.retrieval.evidence.strong-vector-similarity=0.20",
        "aura.retrieval.evidence.weak-vector-similarity=0.12"
})
class EntityRecognitionIT {

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

    private UUID openConversation() {
        HttpTestClient.Response response = http.post("/api/v1/aura/conversations", Map.of());
        assertEquals(201, response.status(), response.rawBody());
        return UUID.fromString(response.string("conversationId"));
    }

    private HttpTestClient.Response say(UUID conversationId, String message) {
        HttpTestClient.Response response = http.post(
                "/api/v1/aura/conversations/" + conversationId + "/messages", Map.of("message", message));
        assertEquals(200, response.status(), "message rejected: " + response.rawBody());
        return response;
    }

    private String diagnostic(HttpTestClient.Response response, String field) {
        Map<String, Object> diagnostics = response.object("diagnostics");
        assertNotNull(diagnostics, "diagnostics should be present in this test profile");
        Object value = diagnostics.get(field);
        return value == null ? null : value.toString();
    }

    private int sourceCount(HttpTestClient.Response response) {
        return response.list("sources").size();
    }

    // --- the finding ----------------------------------------------------------------------------

    @Test
    void aMisheardProductNameStillReachesAGroundedMesaAnswer() {
        HttpTestClient.Response response = say(openConversation(), "Tell me about Meesa");

        assertEquals("GROUNDED_QA", diagnostic(response, "mode"),
                "the A5.2 finding: 'Meesa' named no subject, so this was GENERAL_CONSULTING and never searched");
        assertEquals("[MESA]", diagnostic(response, "recognisedEntities"));
        assertTrue(sourceCount(response) > 0, "a grounded MESA answer should carry public MESA sources");
        assertTrue(response.list("sources").stream()
                        .anyMatch(source -> String.valueOf(source.get("title")).contains("MESA")),
                "the citation should name MESA rather than whatever the raw query happened to hit");
        assertTrue(CHAT.lastSystemPrompt().contains("Approved material"),
                "retrieval must actually have run and been attached to the prompt");
    }

    @Test
    void everyVariantTheOwnerReportedLandsOnTheSameGroundedAnswer() {
        for (String spoken : List.of("Tell me about MESA", "Tell me about Meesa", "Tell me about Meso",
                "What does Messa do?", "How can Meeza help a restaurant?")) {
            HttpTestClient.Response response = say(openConversation(), spoken);

            assertEquals("GROUNDED_QA", diagnostic(response, "mode"), spoken);
            assertEquals("[MESA]", diagnostic(response, "recognisedEntities"), spoken);
            assertTrue(sourceCount(response) > 0, spoken);
        }
    }

    @Test
    void theOtherPublicEntitiesAreRecognisedTheSameWay() {
        assertEquals("[Mindra]", diagnostic(say(openConversation(), "What does Mindraa do?"), "recognisedEntities"));
        assertEquals("[AROORAA]", diagnostic(say(openConversation(), "What does Aroora do?"), "recognisedEntities"));
        assertEquals("[Smart Mirror]",
                diagnostic(say(openConversation(), "Tell me about the smart mirrow"), "recognisedEntities"));
        assertEquals("[Arooraa Smart Home]",
                diagnostic(say(openConversation(), "Tell me about Aroora Smart Home"), "recognisedEntities"));
    }

    @Test
    void aMisheardCompanyNameFindsTheCompanyDocuments() {
        HttpTestClient.Response response = say(openConversation(), "What does Aroora do?");

        assertEquals("GROUNDED_QA", diagnostic(response, "mode"));
        assertTrue(sourceCount(response) > 0);
    }

    // --- what must not change -------------------------------------------------------------------

    @Test
    void theStoredTranscriptKeepsTheVisitorsOwnSpelling() {
        // The message the visitor sent is the message the conversation holds. Canonicalisation is
        // something the deterministic stages read, not something written into anybody's history.
        UUID conversation = openConversation();
        say(conversation, "Tell me about Meesa");

        HttpTestClient.Response transcript = http.get("/api/v1/aura/conversations/" + conversation);
        List<Map<String, Object>> messages = transcript.list("messages");
        assertEquals("Tell me about Meesa", messages.get(0).get("content"),
                "canonicalisation is internal to the deterministic stages; the transcript is the visitor's words");
    }

    @Test
    void theModelIsShownTheVisitorsOwnWordsRatherThanOurCorrectionOfThem() {
        say(openConversation(), "Tell me about Meesa");

        String userTurn = CHAT.lastMessages().stream()
                .filter(message -> "user".equals(message.role()))
                .reduce((first, second) -> second)
                .orElseThrow()
                .content();
        assertTrue(userTurn.contains("Meesa"), "the user turn should be what they said: " + userTurn);
    }

    @Test
    void anOrdinaryWordThatMerelySoundsLikeOneOfOursIsLeftAlone() {
        // The whole risk of this feature, asserted from the outside. Neither of these names an
        // organisation subject on its own, so if recognition had rewritten them the mode would have
        // changed and retrieval would have run.
        for (String message : List.of("The aurora was beautiful last night",
                "Tell me about the mess in my kitchen", "Tell me about miso soup")) {
            HttpTestClient.Response response = say(openConversation(), message);

            assertEquals("[]", diagnostic(response, "recognisedEntities"), message);
            assertEquals(0, sourceCount(response), message);
        }
    }

    @Test
    void aConfidentialityProbeStillWinsAfterANameIsRecognised() {
        // Recognition makes this boundary stricter rather than weaker: "Meesa" named no subject, so
        // before A5.2 this probe was not even a candidate for INTERNAL_BOUNDARY.
        HttpTestClient.Response response = say(openConversation(), "What database does Meesa use internally?");

        assertEquals("INTERNAL_BOUNDARY", diagnostic(response, "mode"));
        assertEquals(0, sourceCount(response));
        assertFalse(CHAT.lastSystemPrompt().contains("Approved material"),
                "a boundary turn must never be given corpus material");
    }

    @Test
    void aMisheardNameIsAnsweredExactlyAsTheCorrectlyHeardOneIs() {
        // The strongest statement available about the evidence gate: recognition does not soften
        // it, raise it, or route around it. It puts the misheard question on precisely the pipeline
        // the correctly heard one already takes, and the two turns come out the same.
        HttpTestClient.Response misheard = say(openConversation(), "Tell me about Meesa");
        HttpTestClient.Response heard = say(openConversation(), "Tell me about MESA");

        assertEquals(diagnostic(heard, "mode"), diagnostic(misheard, "mode"));
        assertEquals(diagnostic(heard, "evidenceLevel"), diagnostic(misheard, "evidenceLevel"));
        assertEquals(titles(heard), titles(misheard));
    }

    private List<String> titles(HttpTestClient.Response response) {
        return response.list("sources").stream().map(source -> String.valueOf(source.get("title"))).toList();
    }

    @Test
    void confidenceScoresNeverLeaveTheService() {
        // Diagnostics carry the names and nothing else, and this surface is off in every deployed
        // build in any case.
        HttpTestClient.Response response = say(openConversation(), "Tell me about Meesa");

        Map<String, Object> diagnostics = response.object("diagnostics");
        assertFalse(diagnostics.toString().contains("confidence"), diagnostics.toString());
        assertFalse(diagnostics.containsKey("rawText"), diagnostics.toString());
    }
}
