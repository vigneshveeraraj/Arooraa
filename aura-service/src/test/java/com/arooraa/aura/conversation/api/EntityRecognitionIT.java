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

    // --- A5.2.4: short natural product questions ------------------------------------------------

    /**
     * The owner asked "mesa uses?" on AROORAA's own website and was answered about the open-source
     * graphics library.
     *
     * <p>What follows asserts the <em>invariant</em> rather than the wording, because this suite
     * runs on {@code StubEmbeddingProvider} and the owner's failure was a real-provider one: the
     * stub's bag-of-words similarity happily matches "mesa uses?" to the MESA documents, so it
     * cannot reproduce the miss. What it can hold permanently is the thing that was actually
     * broken — that a question in this shape names a subject, and that the subject survives to the
     * routing decision instead of being lost on the way to a generic answer.
     */
    @Test
    void aShortNaturalProductQuestionNamesItsSubject() {
        HttpTestClient.Response response = say(openConversation(), "mesa uses?");

        assertEquals("[MESA]", diagnostic(response, "recognisedEntities"),
                "the A5.2.4 finding: 'mesa uses?' named no subject, so nothing downstream knew what it was about");
        assertEquals("GROUNDED_QA", diagnostic(response, "mode"));
        assertTrue(sourceCount(response) > 0, "a question about our product should reach our documents");
    }

    /**
     * The classification invariant the owner asked for, stated as a regression assertion: once the
     * resolver has confidently identified a public entity, that subject must still be there when
     * routing decides what kind of turn this is. Losing it is precisely how a MESA question became
     * a general-knowledge answer about something else.
     */
    @Test
    void aResolvedSubjectRemainsAvailableToTheRoutingDecision() {
        for (String asked : List.of("mesa uses?", "MESA uses?", "mesa use?", "what is mesa used for?",
                "what does mesa do?", "mesa useful?", "mesa useful for restaurant?",
                "how does mesa help restaurants?", "meesa uses?", "meso uses?",
                "MESA enna use?", "mesa ethuku use?", "mesa restaurant-ku epdi useful?",
                "meesa enna pannum?")) {
            HttpTestClient.Response response = say(openConversation(), asked);

            assertEquals("[MESA]", diagnostic(response, "recognisedEntities"), asked);
            String mode = diagnostic(response, "mode");
            assertFalse("GENERAL_CONSULTING".equals(mode) || "OUT_OF_SCOPE".equals(mode) || "SOCIAL".equals(mode),
                    asked + " kept its subject but still routed to " + mode);
        }
    }

    /**
     * Recognition alone was not the whole defect. Retrieval can legitimately come back empty, and
     * the no-evidence rule used to tell the model that general knowledge was fully available — which
     * is exactly the licence it took to answer about the graphics library. So when the subject is
     * one of ours, the prompt has to say so.
     */
    @Test
    void thePromptStatesWhoseProductTheQuestionIsAbout() {
        say(openConversation(), "mesa uses?");

        String prompt = CHAT.lastSystemPrompt();
        assertTrue(prompt.contains("What they are asking about"), prompt);
        assertTrue(prompt.contains("MESA"), "the recognised subject should be named in the prompt");
        assertTrue(prompt.contains("the only thing that name"),
                "the prompt should close the door on the same name meaning something else");
    }

    /**
     * The negative controls, from the outside. The resolver's own unit test covers the vocabulary;
     * this asserts that nothing downstream re-resolves what the resolver declined.
     *
     * <p>Deliberately an assertion about the recognised subject and not about source count: the
     * lexical arm of hybrid retrieval matches the literal token "mesa" whoever meant it, which is
     * retrieval behaviour that predates this milestone and that A5.2.4 does not touch.
     */
    @Test
    void anEverydayUseOfAnEverydayWordNamesNoSubjectOfOurs() {
        for (String asked : List.of("I want a mesa in my dining room", "The mesa is beautiful",
                "We saw a mesa in Arizona", "Tell me about mesa landforms", "I need a dining table",
                "miso soup", "the mess in my kitchen", "that was a messy release")) {
            assertEquals("[]", diagnostic(say(openConversation(), asked), "recognisedEntities"), asked);
        }
    }

    /**
     * Confidentiality still wins, in the new short phrasing too. Recognising MESA here makes the
     * probe legible as a probe; it does not make any of it answerable.
     */
    @Test
    void aConfidentialityProbeStillWinsInTheShortPhrasing() {
        HttpTestClient.Response response = say(openConversation(), "What database does mesa use internally?");

        assertEquals("[MESA]", diagnostic(response, "recognisedEntities"));
        assertEquals("INTERNAL_BOUNDARY", diagnostic(response, "mode"));
        assertEquals(0, sourceCount(response));
        assertFalse(CHAT.lastSystemPrompt().contains("Approved material"),
                "a boundary turn must never be given corpus material");
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
