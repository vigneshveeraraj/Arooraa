package com.arooraa.aura.retrieval;

import com.arooraa.aura.ingestion.IngestionService;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.imports.KnowledgeActivationService;
import com.arooraa.aura.knowledge.imports.KnowledgeApprovalService;
import com.arooraa.aura.knowledge.imports.KnowledgeImportService;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.file.Path;
import java.util.List;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The A2 milestone's required local evaluation fixture: imports, approves, ingests and activates
 * a small controlled reviewed subset of the real knowledge-seed documents (plus one real INTERNAL
 * rule document and one synthetic INTERNAL fixture — see {@code 99-internal-test-fixture.md}),
 * then runs every representative acceptance question and the Tamil/Tanglish probe through the
 * real {@link HybridRetrievalService}. This is the "internal retrieval queries and inspect the
 * evidence Aura would receive" proof the milestone asks for — no LLM answer is generated, only
 * evidence is inspected.
 *
 * <p>Uses {@link StubEmbeddingProvider} (deterministic, dependency-free) rather than a real
 * OpenAI key — this proves retrieval *mechanics* (fusion, eligibility boundary, evidence gating)
 * correctly; it does not and cannot prove real semantic/multilingual embedding quality, which
 * needs the real provider. See the A2 final report's Tamil/Tanglish baseline section for what
 * this run actually shows.
 *
 * <p>Seeds via {@code @BeforeEach} (not {@code @BeforeAll}) — {@code @TestInstance(PER_CLASS)}
 * combined with {@code @Testcontainers}/{@code @DynamicPropertySource} fails ("mapped port can
 * only be obtained after the container is started"), a known ordering incompatibility between
 * per-class test instance creation and container startup. Re-seeding before every test is safe
 * and cheap: {@link #indexAndActivate} re-checks each version's real current status before acting,
 * so importing/approving/ingesting/activating an already-fully-processed document is a genuine
 * no-op, not a re-throw.
 */
@Testcontainers
@SpringBootTest
class KnowledgeBaseAcceptanceIT {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeBaseAcceptanceIT.class);

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

    @TestConfiguration
    static class StubProviderConfig {
        @Bean
        @Primary
        EmbeddingProvider stubEmbeddingProvider() {
            return new StubEmbeddingProvider();
        }
    }

    @Autowired
    private KnowledgeImportService importService;
    @Autowired
    private KnowledgeApprovalService approvalService;
    @Autowired
    private IngestionService ingestionService;
    @Autowired
    private KnowledgeActivationService activationService;
    @Autowired
    private HybridRetrievalService retrievalService;
    @Autowired
    private AuraDocumentVersionRepository versionRepository;

    /** The reviewed subset actually approved for this run — deliberately NOT the full 27-document seed (frozen A2 requirement). */
    private static final List<String> PUBLIC_SEED_SLUGS = List.of(
            "01-company-overview", "02-company-philosophy", "03-how-arooraa-works",
            "10-mesa", "11-mindra", "21-product-engineering", "22-ai-data-automation",
            "23-application-modernization");

    /** A real Aura rule document — INTERNAL by its own frontmatter — imported/approved/indexed like any other content, to prove real (not just synthetic) internal content stays excluded from public retrieval. */
    private static final String INTERNAL_REAL_SLUG = "91-aura-confidentiality-and-safety";

    private static final List<String> LEAK_DENYLIST = List.of(
            "postgres", "mysql", "mongodb", "redis", "kubernetes", "docker", "aws", "azure",
            "google cloud", "digitalocean", "hostinger", "spring boot", "java", "kafka");

    @BeforeEach
    void seedApprovedKnowledgeBase() {
        for (String slug : PUBLIC_SEED_SLUGS) {
            indexAndActivate(seedPath(slug));
        }
        indexAndActivate(seedPath(INTERNAL_REAL_SLUG));
        indexAndActivate(fixturePath("99-internal-test-fixture"));
    }

    private static Path seedPath(String slug) {
        return Path.of("knowledge-seed", slug + ".md");
    }

    private static Path fixturePath(String slug) {
        return Path.of("src", "test", "resources", "fixtures", slug + ".md");
    }

    /** Fully idempotent: re-fetches the version's real current status before each step so re-running against an already-processed document is a no-op. */
    private void indexAndActivate(Path file) {
        AuraDocumentVersion version = importService.importFromFile(file);

        version = versionRepository.findById(version.getId()).orElseThrow();
        if (version.getStatus() == DocumentStatus.DRAFT || version.getStatus() == DocumentStatus.IN_REVIEW) {
            approvalService.approve(version.getId(), "a2-acceptance-test@arooraa.com");
        }

        version = versionRepository.findById(version.getId()).orElseThrow();
        if (version.getStatus() == DocumentStatus.APPROVED) {
            // ingest() marks this same version row INDEXED in place — its id doesn't change.
            ingestionService.ingest(version.getId());
        }

        version = versionRepository.findById(version.getId()).orElseThrow();
        if (version.getStatus() == DocumentStatus.INDEXED && !version.isActive()) {
            activationService.activate(version.getId());
        }
    }

    private RetrievalResult evaluate(String question) {
        RetrievalResult result = retrievalService.retrieve(
                new RetrievalRequest(question, AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));
        String topSlug = result.evidence().isEmpty() ? "(none)" : result.evidence().get(0).documentSlug();
        double topScore = result.evidence().isEmpty() ? 0.0 : result.evidence().get(0).normalizedScore();
        log.info("ACCEPTANCE QUESTION: \"{}\" -> level={} topSlug={} topNormalizedScore={} evidenceCount={}",
                question, result.evidenceLevel(), topSlug, topScore, result.evidence().size());
        return result;
    }

    private void assertNoInternalDisclosure(RetrievalResult result) {
        for (Evidence evidence : result.evidence()) {
            String lower = evidence.text().toLowerCase(Locale.ROOT);
            for (String forbidden : LEAK_DENYLIST) {
                assertFalse(lower.contains(forbidden),
                        "evidence must never disclose internal implementation detail, found \"" + forbidden + "\"");
            }
        }
    }

    @Test
    void whatIsAroora() {
        RetrievalResult result = evaluate("What is AROORAA?");
        assertTrue(!result.evidence().isEmpty());
        assertTrue(result.evidence().stream().anyMatch(e ->
                e.documentSlug().equals("01-company-overview") || e.documentSlug().equals("02-company-philosophy")
                        || e.documentSlug().equals("03-how-arooraa-works")));
    }

    @Test
    void whatDoesAroraaBuild() {
        RetrievalResult result = evaluate("What does AROORAA build?");
        assertTrue(!result.evidence().isEmpty());
    }

    @Test
    void whatIsMesa() {
        RetrievalResult result = evaluate("What is MESA?");
        assertTrue(!result.evidence().isEmpty());
        assertTrue(result.evidence().get(0).documentSlug().equals("10-mesa"));
    }

    @Test
    void canMesaHelpRestaurants() {
        RetrievalResult result = evaluate("Can MESA help restaurants?");
        assertTrue(!result.evidence().isEmpty());
        assertTrue(result.evidence().stream().anyMatch(e -> e.documentSlug().equals("10-mesa")));
    }

    @Test
    void whatIsMindra() {
        RetrievalResult result = evaluate("What is Mindra?");
        assertTrue(!result.evidence().isEmpty());
        assertTrue(result.evidence().get(0).documentSlug().equals("11-mindra"));
    }

    @Test
    void whatServicesDoesAroraaOffer() {
        // Only 21/22/23 of the six service lines are in this run's approved subset — see class Javadoc.
        RetrievalResult result = evaluate("What services does AROORAA offer?");
        assertTrue(!result.evidence().isEmpty());
    }

    @Test
    void canAroraaHelpBuildAnAiProduct() {
        RetrievalResult result = evaluate("Can AROORAA help build an AI product?");
        assertTrue(!result.evidence().isEmpty());
        assertTrue(result.evidence().stream().anyMatch(e -> e.documentSlug().equals("22-ai-data-automation")));
    }

    @Test
    void canAroraaModernizeAnExistingApplication() {
        RetrievalResult result = evaluate("Can AROORAA modernize an existing application?");
        assertTrue(!result.evidence().isEmpty());
        assertTrue(result.evidence().stream().anyMatch(e -> e.documentSlug().equals("23-application-modernization")));
    }

    @Test
    void whatDatabaseDoesMesaUseInternally() {
        RetrievalResult result = evaluate("What database does MESA use internally?");
        assertNoInternalDisclosure(result);
    }

    @Test
    void whatTechnologyPowersAura() {
        RetrievalResult result = evaluate("What technology powers Aura?");
        assertNoInternalDisclosure(result);
    }

    @Test
    void tamilTanglishProbeAroraaEnnaCompany() {
        RetrievalResult result = assertDoesNotThrow(() -> evaluate("AROORAA enna company?"));
        assertNoInternalDisclosure(result);
    }

    @Test
    void tamilTanglishProbeMesaRestaurantHelp() {
        RetrievalResult result = assertDoesNotThrow(() -> evaluate("MESA restaurant-ku enna help pannum?"));
        assertNoInternalDisclosure(result);
    }

    @Test
    void tamilTanglishProbeAiProductBuild() {
        RetrievalResult result = assertDoesNotThrow(() -> evaluate("Enaku AI product build panna mudiyuma?"));
        assertNoInternalDisclosure(result);
    }

    @Test
    void realInternalRuleDocumentIsNeverRetrievableThroughPublicRetrieval() {
        RetrievalResult result = evaluate("What is Aura's confidentiality and safety policy?");
        assertTrue(result.evidence().stream().noneMatch(e -> e.documentSlug().equals(INTERNAL_REAL_SLUG)),
                "a real INTERNAL rule document must never surface via the public retrieval path");
    }

    @Test
    void syntheticInternalFixtureIsNeverRetrievableEvenOnExactPhraseMatch() {
        RetrievalResult result = evaluate("INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ");
        assertTrue(result.evidence().stream().noneMatch(e -> e.text().contains("INTERNAL_SECRET_ARCHITECTURE_TOKEN_XYZ")));
    }
}
