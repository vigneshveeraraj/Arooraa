package com.arooraa.aura.retrieval;

import com.arooraa.aura.ingestion.IngestionService;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.imports.KnowledgeActivationService;
import com.arooraa.aura.knowledge.imports.KnowledgeApprovalService;
import com.arooraa.aura.knowledge.imports.KnowledgeImportService;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * A2.1's real-embedding calibration run — the local, controlled measurement the milestone
 * requires ("real OpenAI embeddings have been evaluated locally"). Deliberately NOT part of the
 * secretless test suite: gated on {@code OPENAI_API_KEY} actually being present in the
 * environment, so {@code mvn verify} without a key skips it cleanly rather than failing.
 *
 * <p>Never touches the key directly — it is read only by {@code OpenAiEmbeddingProvider} via
 * Spring's normal environment resolution ({@code @Value("${OPENAI_API_KEY:}")}), which this class
 * never imports or references. Nothing here logs, prints, asserts on, or persists the key, and no
 * response body is logged — only the numeric similarity/coverage measurements and public,
 * already-approved evidence text.
 *
 * <p>Runs against generation 2 ({@code aura.provider.embedding.generation}), so these vectors sit
 * alongside — never overwrite — the generation-1 stub vectors {@link KnowledgeBaseAcceptanceIT}
 * produces, and both can be inspected independently in the same schema (V3).
 *
 * <p>To run: {@code OPENAI_API_KEY=sk-... mvn -o failsafe:integration-test -Dit.test=EmbeddingCalibrationIT}
 */
@Testcontainers
@SpringBootTest(properties = {
        "aura.provider.embedding.enabled=true",
        "aura.provider.embedding.provider=openai",
        "aura.provider.embedding.model=text-embedding-3-small",
        "aura.provider.embedding.dimensions=1536",
        "aura.provider.embedding.generation=2"
})
@EnabledIfEnvironmentVariable(named = "OPENAI_API_KEY", matches = ".+")
class EmbeddingCalibrationIT {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingCalibrationIT.class);

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
    private HybridRetrievalService retrievalService;

    private record Measurement(String query, String label, EvidenceLevel level, Double similarity,
                                double coverage, boolean agree, String topSlug) {
    }

    @Test
    void calibrateAgainstTheRealEmbeddingProvider() {
        KnowledgeCorpusFixture fixture = new KnowledgeCorpusFixture(
                importService, approvalService, ingestionService, activationService, versionRepository);
        List<AuraDocumentVersion> versions = fixture.seedAll();
        log.info("Seeded {} version(s) at embedding generation 2 (real provider).", versions.size());

        List<Measurement> positive = measure(EvaluationSets.POSITIVE, "POSITIVE");
        List<Measurement> negative = measure(EvaluationSets.NEGATIVE, "NEGATIVE");
        List<Measurement> internal = measure(EvaluationSets.INTERNAL_BOUNDARY, "INTERNAL_BOUNDARY");
        List<Measurement> multilingual = measure(EvaluationSets.MULTILINGUAL, "MULTILINGUAL");

        logTable("POSITIVE", positive);
        logTable("NEGATIVE", negative);
        logTable("INTERNAL_BOUNDARY", internal);
        logTable("MULTILINGUAL", multilingual);
        logDistribution("POSITIVE", positive);
        logDistribution("NEGATIVE", negative);

        // Adversarial tokens must stay unretrievable regardless of embedding quality.
        for (String token : EvaluationSets.ADVERSARIAL_TOKENS) {
            RetrievalResult result = retrievalService.retrieve(
                    new RetrievalRequest(token, AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));
            assertTrue(result.evidence().stream().noneMatch(e -> e.text().contains(token)),
                    "adversarial token leaked with the real provider: " + token);
        }

        // Sanity check that the real embeddings carry actual signal: on average, questions the
        // corpus answers should score higher than questions it has nothing to do with. This is
        // intentionally the only hard assertion on quality — everything else is measurement to be
        // read from the log, not asserted, because calibrating IS this test's purpose.
        double meanPositive = positive.stream().mapToDouble(m -> m.similarity() == null ? 0 : m.similarity()).average().orElse(0);
        double meanNegative = negative.stream().mapToDouble(m -> m.similarity() == null ? 0 : m.similarity()).average().orElse(0);
        log.info("Mean top similarity — positive: {}, negative: {}", fmt(meanPositive), fmt(meanNegative));
        assertTrue(meanPositive > meanNegative,
                "real embeddings should separate relevant from irrelevant questions on average");
    }

    private List<Measurement> measure(List<EvaluationSets.Query> queries, String label) {
        List<Measurement> measurements = new ArrayList<>();
        for (EvaluationSets.Query query : queries) {
            RetrievalResult result = retrievalService.retrieve(
                    new RetrievalRequest(query.text(), AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB));
            String topSlug = result.evidence().isEmpty() ? "(none)" : result.evidence().get(0).documentSlug();
            measurements.add(new Measurement(query.text(), label, result.evidenceLevel(),
                    result.signals().topVectorSimilarity(), result.signals().queryTermCoverage(),
                    result.signals().signalsAgree(), topSlug));
        }
        return measurements;
    }

    private void logTable(String setName, List<Measurement> measurements) {
        log.info("--- {} (real provider, generation 2) ---", setName);
        for (Measurement m : measurements) {
            log.info("  \"{}\" -> level={} topSlug={} similarity={} coverage={} agree={}",
                    m.query(), m.level(), m.topSlug(), fmt(m.similarity()), fmt(m.coverage()), m.agree());
        }
    }

    private void logDistribution(String setName, List<Measurement> measurements) {
        List<Double> similarities = measurements.stream()
                .map(Measurement::similarity).filter(java.util.Objects::nonNull)
                .sorted().collect(Collectors.toList());
        if (similarities.isEmpty()) {
            log.info("{} similarity distribution: no vector hits", setName);
            return;
        }
        double min = similarities.get(0);
        double max = similarities.get(similarities.size() - 1);
        double mean = similarities.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double median = similarities.get(similarities.size() / 2);
        log.info("{} similarity distribution: min={} median={} mean={} max={} n={}",
                setName, fmt(min), fmt(median), fmt(mean), fmt(max), similarities.size());
    }

    private static String fmt(Double value) {
        return value == null ? "n/a" : String.format(Locale.ROOT, "%.3f", value);
    }

    private static String fmt(double value) {
        return String.format(Locale.ROOT, "%.3f", value);
    }
}
