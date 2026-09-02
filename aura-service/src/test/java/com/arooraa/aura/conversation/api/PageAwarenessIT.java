package com.arooraa.aura.conversation.api;

import com.arooraa.aura.ingestion.IngestionService;
import com.arooraa.aura.knowledge.imports.KnowledgeActivationService;
import com.arooraa.aura.knowledge.imports.KnowledgeApprovalService;
import com.arooraa.aura.knowledge.imports.KnowledgeImportService;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * A4.1 finding 3: {@code currentPath=/products/mesa} plus "Tell me more about this." was answered
 * as {@code GENERAL_CONSULTING}/{@code NO_EVIDENCE} — generic, ungrounded platform talk with no
 * MESA evidence at all, because the message names no organisation subject and nothing resolved the
 * pronoun. This class is the regression suite for {@code PageAwareScopeResolver},
 * {@code PageContextRegistry} and {@code ContextualReferenceDetector} together, exercised the same
 * way {@code AuraChatApiIT} exercises the rest of the pipeline: real HTTP, real Postgres/pgvector,
 * a deterministic fake chat provider.
 *
 * <h2>EVIDENCE THRESHOLDS</h2>
 * Rescaled again here, separately from {@code AuraChatApiIT}, for the same underlying reason as
 * that class's own EVIDENCE THRESHOLDS note — {@code StubEmbeddingProvider}'s bag-of-words cosine
 * similarities have nothing like a real model's scale — but measured against a different query
 * shape. {@code PageAwareScopeResolver} always searches "Tell me about {@code <subject>}" rather
 * than the visitor's actual words, and that canonical query scores differently per subject under
 * the stub: measured directly against this corpus, "Tell me about MESA" tops out at 0.180, and
 * "Tell me about Application Modernization" — a longer, multi-word subject name against a longer,
 * less repetitive services document — at 0.145. Both are genuine top-ranked matches for their own
 * document (coverage 1.0 in both cases); the floor here is set below the lower of the two
 * measurements rather than guessed, the same discipline {@code AuraChatApiIT} documents.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "aura.chat.enabled=true",
        "aura.chat.diagnostics-enabled=true",
        "aura.retrieval.evidence.strong-vector-similarity=0.20",
        "aura.retrieval.evidence.weak-vector-similarity=0.12"
})
class PageAwarenessIT {

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

    private HttpTestClient.Response say(UUID conversationId, String message, String currentPath) {
        Map<String, Object> body = currentPath == null
                ? Map.of("message", message)
                : Map.of("message", message, "currentPath", currentPath);
        HttpTestClient.Response response = http.post(
                "/api/v1/aura/conversations/" + conversationId + "/messages", body);
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

    // --- test 11 + 12 + 13 + 14: MESA page context ----------------------------------------------

    @Test
    void tellMeMoreAboutThisOnTheMesaPageResolvesToAGroundedMesaAnswer() {
        UUID conversation = openConversation();

        HttpTestClient.Response response = say(conversation, "Tell me more about this.", "/products/mesa");

        assertEquals("GROUNDED_QA", diagnostic(response, "mode"),
                "the A4.1 defect: this was GENERAL_CONSULTING because the message names no subject");
        assertFalse("NO_EVIDENCE".equals(diagnostic(response, "evidenceLevel")),
                "and a real MESA answer must not be told it has nothing to ground");
        assertTrue(sourceCount(response) > 0, "a grounded MESA answer should carry public MESA sources");
        assertTrue(response.list("sources").stream()
                        .anyMatch(source -> String.valueOf(source.get("title")).contains("MESA")),
                "the citation should name MESA, not something the retrieval query happened to hit");
        assertTrue(CHAT.lastSystemPrompt().contains("Approved material"),
                "retrieval must actually have run and been attached to the prompt");
    }

    @Test
    void everyContextualPhraseOnTheMesaPageResolvesTheSameWay() {
        for (String phrase : List.of("Tell me more about this.", "What does this do?", "How can this help me?",
                "Is this suitable for my business?", "What are its benefits?", "Can I use this?", "Explain this.",
                "How does it work?", "Tell me more.", "What about this product?")) {
            HttpTestClient.Response response = say(openConversation(), phrase, "/products/mesa");

            assertEquals("GROUNDED_QA", diagnostic(response, "mode"), phrase);
            assertTrue(sourceCount(response) > 0, phrase);
        }
    }

    // --- test 15: service page context ----------------------------------------------------------

    @Test
    void howCouldThisHelpOnTheApplicationModernizationPageResolvesToThatService() {
        HttpTestClient.Response response = say(openConversation(),
                "How could this help my existing application?", "/services/application-modernization");

        assertEquals("GROUNDED_QA", diagnostic(response, "mode"));
        assertTrue(sourceCount(response) > 0);
        assertTrue(response.list("sources").stream()
                        .anyMatch(source -> String.valueOf(source.get("title")).contains("Application Modernization")),
                "the citation should name the service the visitor was actually looking at");
    }

    @Test
    void theOwnerRetestPhrasingAlsoResolvesToApplicationModernization() {
        HttpTestClient.Response response = say(openConversation(),
                "How could this help my existing software?", "/services/application-modernization");

        assertEquals("GROUNDED_QA", diagnostic(response, "mode"));
        assertTrue(sourceCount(response) > 0);
    }

    // --- test 16: unknown page ---------------------------------------------------------------

    @Test
    void anUnmappedPageNeverFabricatesASubject() {
        HttpTestClient.Response response = say(openConversation(),
                "Tell me more about this.", "/some/page/aura-has-never-heard-of");

        assertEquals("GENERAL_CONSULTING", diagnostic(response, "mode"));
        assertEquals(0, sourceCount(response));
        assertFalse(CHAT.lastSystemPrompt().contains("Approved material"));
    }

    @Test
    void noCurrentPathAtAllBehavesExactlyAsBefore() {
        HttpTestClient.Response response = say(openConversation(), "Tell me more about this.", null);

        assertEquals("GENERAL_CONSULTING", diagnostic(response, "mode"));
        assertEquals(0, sourceCount(response));
    }

    // --- test 17: currentPath is context, not authorization ---------------------------------

    @Test
    void anArbitraryCurrentPathCannotTurnAConfidentialityProbeIntoAGroundedAnswer() {
        // The resolver only ever narrows GENERAL_CONSULTING. A question that is independently
        // classified INTERNAL_BOUNDARY must stay that way regardless of what currentPath claims.
        HttpTestClient.Response response = say(openConversation(),
                "What database does MESA use internally?", "/products/mesa");

        assertEquals("INTERNAL_BOUNDARY", diagnostic(response, "mode"));
        assertEquals(0, sourceCount(response));
        assertFalse(CHAT.lastSystemPrompt().contains("Approved material"));
    }

    @Test
    void anInventedPathStringCannotBeUsedAsAKnowledgeSpaceSelector() {
        // A path that merely looks meaningful (and is not one of the fixed known routes) must
        // resolve to nothing, the same as any other unmapped path.
        HttpTestClient.Response response = say(openConversation(),
                "Tell me more about this.", "/knowledge-space/AURA_POLICY");

        assertEquals("GENERAL_CONSULTING", diagnostic(response, "mode"));
        assertEquals(0, sourceCount(response));
    }

    // --- test 19: the visitor's own words are never rewritten -------------------------------

    @Test
    void theStoredTranscriptKeepsTheVisitorsOriginalWordingUnchanged() {
        UUID conversation = openConversation();

        say(conversation, "Tell me more about this.", "/products/mesa");

        HttpTestClient.Response transcript = http.get("/api/v1/aura/conversations/" + conversation);
        List<Map<String, Object>> messages = transcript.list("messages");
        assertEquals("Tell me more about this.", messages.get(0).get("content"),
                "the contextualization is internal to retrieval; the transcript is the visitor's own words");
    }

    // --- test 20: contextual grounding still respects source hygiene ------------------------

    @Test
    void aContextualMesaAnswerNeverExposesAssistantControlWording() {
        HttpTestClient.Response response = say(openConversation(), "Tell me more about this.", "/products/mesa");

        for (Map<String, Object> source : response.list("sources")) {
            String title = String.valueOf(source.get("title")).toLowerCase(java.util.Locale.ROOT);
            String section = String.valueOf(source.get("section")).toLowerCase(java.util.Locale.ROOT);
            for (String forbidden : List.of("must not disclose", "confidentiality instruction",
                    "internal guidance", "prompt policy", "assistant instruction", "guardrail")) {
                assertFalse(title.contains(forbidden), title);
                assertFalse(section.contains(forbidden), section);
            }
        }
    }
}
