package com.arooraa.aura.retrieval;

import com.arooraa.aura.config.AuraSafetyProperties;
import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.domain.AuraDocument;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.config.ProviderProperties;
import com.arooraa.aura.retrieval.access.AccessPolicy;
import com.arooraa.aura.retrieval.config.RetrievalProperties;
import com.arooraa.aura.retrieval.search.LexicalHit;
import com.arooraa.aura.retrieval.search.LexicalSearchRepository;
import com.arooraa.aura.retrieval.search.VectorHit;
import com.arooraa.aura.retrieval.search.VectorSearchRepository;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Orchestrates vector + lexical search, Reciprocal Rank Fusion, and the evidence gate into one
 * retrieval call. Gracefully degrades to lexical-only when no embedding provider is enabled
 * (the A2 default/dev posture) rather than failing — retrieval must still work with zero AI
 * configuration present, same production-safety principle as the provider layer itself.
 *
 * <p>Reranking: {@code RerankingProvider} stays disabled by default (frozen A0/A1 wiring,
 * untouched); the RRF-fused order itself is the deterministic baseline ranking. A real model
 * reranker is an explicit future step once baseline retrieval quality is accepted.
 *
 * <p>Confidence vs. ranking (A2.1): RRF orders {@link Evidence}, it never decides
 * {@link EvidenceLevel} — see {@link #measureRelevance} and {@link EvidenceGateService}.
 */
@Service
public class HybridRetrievalService {

    private static final Logger log = LoggerFactory.getLogger(HybridRetrievalService.class);

    private final AccessPolicy accessPolicy;
    private final EmbeddingProvider embeddingProvider;
    private final VectorSearchRepository vectorSearchRepository;
    private final LexicalSearchRepository lexicalSearchRepository;
    private final AuraChunkRepository chunkRepository;
    private final AuraDocumentVersionRepository versionRepository;
    private final AuraDocumentRepository documentRepository;
    private final EvidenceGateService evidenceGateService;
    private final RetrievalProperties properties;
    private final AuraSafetyProperties safetyProperties;
    /** Retrieval only ever searches one embedding cohort — mixing generations would compare vectors produced by different models. */
    private final int embeddingGeneration;
    private final Timer retrievalLatencyTimer;
    /** Component-level timers (A2.1 performance baseline) — separate from the total so a slow query can be attributed to embedding, vector search, or lexical search specifically. */
    private final Timer embeddingLatencyTimer;
    private final Timer vectorSearchLatencyTimer;
    private final Timer lexicalSearchLatencyTimer;
    private final DistributionSummary vectorResultCountSummary;
    private final DistributionSummary lexicalResultCountSummary;

    public HybridRetrievalService(AccessPolicy accessPolicy,
                                   EmbeddingProvider embeddingProvider,
                                   VectorSearchRepository vectorSearchRepository,
                                   LexicalSearchRepository lexicalSearchRepository,
                                   AuraChunkRepository chunkRepository,
                                   AuraDocumentVersionRepository versionRepository,
                                   AuraDocumentRepository documentRepository,
                                   EvidenceGateService evidenceGateService,
                                   RetrievalProperties properties,
                                   AuraSafetyProperties safetyProperties,
                                   ProviderProperties providerProperties,
                                   MeterRegistry meterRegistry) {
        this.accessPolicy = accessPolicy;
        this.embeddingProvider = embeddingProvider;
        this.vectorSearchRepository = vectorSearchRepository;
        this.lexicalSearchRepository = lexicalSearchRepository;
        this.chunkRepository = chunkRepository;
        this.versionRepository = versionRepository;
        this.documentRepository = documentRepository;
        this.evidenceGateService = evidenceGateService;
        this.properties = properties;
        this.safetyProperties = safetyProperties;
        this.embeddingGeneration = providerProperties.embedding().generation();
        this.retrievalLatencyTimer = meterRegistry.timer("aura.retrieval.latency");
        this.embeddingLatencyTimer = meterRegistry.timer("aura.retrieval.embedding.latency");
        this.vectorSearchLatencyTimer = meterRegistry.timer("aura.retrieval.vector.latency");
        this.lexicalSearchLatencyTimer = meterRegistry.timer("aura.retrieval.lexical.latency");
        this.vectorResultCountSummary = DistributionSummary.builder("aura.retrieval.vector.results").register(meterRegistry);
        this.lexicalResultCountSummary = DistributionSummary.builder("aura.retrieval.lexical.results").register(meterRegistry);
    }

    public RetrievalResult retrieve(RetrievalRequest request) {
        return retrievalLatencyTimer.record(() -> doRetrieve(request));
    }

    private RetrievalResult doRetrieve(RetrievalRequest request) {
        if (safetyProperties.rawPromptLoggingEnabled()) {
            log.debug("Retrieval query: \"{}\"", request.query());
        } else {
            log.info("Retrieval query received (length={} chars)", request.query().length());
        }

        Set<String> knowledgeSpaces = accessPolicy.authorizedKnowledgeSpaces(request.profile(), request.channel());
        if (knowledgeSpaces.isEmpty()) {
            log.warn("No knowledge space authorized for profile={} channel={} — returning NO_EVIDENCE.",
                    request.profile(), request.channel());
            return RetrievalResult.noEvidence(request.query());
        }

        boolean vectorSearchRan = embeddingProvider.isEnabled();
        List<VectorHit> vectorHits = List.of();
        if (vectorSearchRan) {
            float[] queryVector = embeddingLatencyTimer.record(() -> embeddingProvider.embed(request.query())).vector();
            vectorHits = vectorSearchLatencyTimer.record(() -> vectorSearchRepository.search(
                    queryVector, knowledgeSpaces, embeddingGeneration, properties.candidateLimit()));
        }
        List<LexicalHit> lexicalHits = lexicalSearchLatencyTimer.record(
                () -> lexicalSearchRepository.search(request.query(), knowledgeSpaces, properties.candidateLimit()));

        vectorResultCountSummary.record(vectorHits.size());
        lexicalResultCountSummary.record(lexicalHits.size());

        List<UUID> vectorRanked = vectorHits.stream().map(VectorHit::chunkId).toList();
        List<UUID> lexicalRanked = lexicalHits.stream().map(LexicalHit::chunkId).toList();
        Map<UUID, Double> fused = RrfFusion.fuse(vectorRanked, lexicalRanked, properties.rrfK());

        int signalCount = (vectorSearchRan ? 1 : 0) + 1;
        double maxPossibleScore = RrfFusion.maxPossibleScore(signalCount, properties.rrfK());

        List<UUID> orderedChunkIds = fused.entrySet().stream()
                .sorted(Map.Entry.<UUID, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .limit(properties.resultLimit())
                .toList();

        Map<UUID, Integer> vectorRankByChunk = rankIndex(vectorRanked);
        Map<UUID, Integer> lexicalRankByChunk = rankIndex(lexicalRanked);
        Map<UUID, Double> vectorSimilarityByChunk = new HashMap<>();
        for (VectorHit hit : vectorHits) {
            vectorSimilarityByChunk.put(hit.chunkId(), 1.0 - hit.distance());
        }
        Map<UUID, Double> lexicalScoreByChunk = new HashMap<>();
        for (LexicalHit hit : lexicalHits) {
            lexicalScoreByChunk.put(hit.chunkId(), hit.rank());
        }

        List<Evidence> evidence = new ArrayList<>();
        int combinedRank = 0;
        for (UUID chunkId : orderedChunkIds) {
            combinedRank++;
            loadEvidence(chunkId, vectorRankByChunk.get(chunkId), vectorSimilarityByChunk.get(chunkId),
                    lexicalRankByChunk.get(chunkId), lexicalScoreByChunk.get(chunkId),
                    combinedRank, fused.get(chunkId), fused.get(chunkId) / maxPossibleScore)
                    .ifPresent(evidence::add);
        }

        RelevanceSignals signals = measureRelevance(request.query(), evidence, vectorRankByChunk, lexicalRankByChunk);
        EvidenceLevel level = evidenceGateService.classify(evidence, signals);
        log.info("Retrieval returned {} evidence item(s), level={} (topSimilarity={}, coverage={}, agree={}).",
                evidence.size(), level, format(signals.topVectorSimilarity()),
                format(signals.queryTermCoverage()), signals.signalsAgree());
        return new RetrievalResult(request.query(), level, signals, evidence);
    }

    /**
     * Measures the absolute relevance of the top-ranked evidence. Deliberately reads only the top
     * result: the gate's question is "can the best thing we found support a claim?", and averaging
     * in weaker neighbours would let a large corpus dilute — or a small one inflate — that answer.
     */
    private RelevanceSignals measureRelevance(String query, List<Evidence> evidence,
                                               Map<UUID, Integer> vectorRankByChunk,
                                               Map<UUID, Integer> lexicalRankByChunk) {
        if (evidence.isEmpty()) {
            return RelevanceSignals.none();
        }
        Evidence top = evidence.get(0);
        boolean agree = vectorRankByChunk.containsKey(top.chunkId()) && lexicalRankByChunk.containsKey(top.chunkId());
        double coverage = QueryTermCoverage.of(query, top.text());
        return new RelevanceSignals(top.vectorSimilarity(), top.lexicalScore(), coverage, agree);
    }

    private static String format(Double value) {
        return value == null ? "n/a" : String.format(java.util.Locale.ROOT, "%.3f", value);
    }

    private static String format(double value) {
        return String.format(java.util.Locale.ROOT, "%.3f", value);
    }

    private java.util.Optional<Evidence> loadEvidence(UUID chunkId, Integer vectorRank, Double vectorSimilarity,
                                                        Integer lexicalRank, Double lexicalScore, int combinedRank,
                                                        double combinedScore, double normalizedScore) {
        return chunkRepository.findById(chunkId).flatMap(chunk ->
                versionRepository.findById(chunk.getDocumentVersionId()).flatMap(version ->
                        documentRepository.findById(version.getDocumentId()).map(document ->
                                toEvidence(document, version, chunk, vectorRank, vectorSimilarity, lexicalRank,
                                        lexicalScore, combinedRank, combinedScore, normalizedScore))));
    }

    private Evidence toEvidence(AuraDocument document, AuraDocumentVersion version, AuraChunk chunk,
                                 Integer vectorRank, Double vectorSimilarity, Integer lexicalRank, Double lexicalScore,
                                 int combinedRank, double combinedScore, double normalizedScore) {
        return new Evidence(
                document.getId(), document.getSlug(), document.getTitle(),
                version.getId(), version.getVersionNumber(), document.getKnowledgeSpace(),
                chunk.getId(), chunk.getChunkIndex(), chunk.getSectionHeading(),
                version.getSourceUrl(), chunk.getContent(),
                vectorRank, vectorSimilarity, lexicalRank, lexicalScore,
                combinedRank, combinedScore, normalizedScore);
    }

    private static Map<UUID, Integer> rankIndex(List<UUID> ranked) {
        Map<UUID, Integer> ranks = new HashMap<>();
        for (int i = 0; i < ranked.size(); i++) {
            ranks.put(ranked.get(i), i + 1);
        }
        return ranks;
    }
}
