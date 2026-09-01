package com.arooraa.aura.ingestion;

import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.AuraEmbedding;
import com.arooraa.aura.knowledge.domain.DocumentStatus;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.knowledge.repository.AuraEmbeddingRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.EmbeddingResult;
import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import com.arooraa.aura.provider.config.ProviderProperties;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Chunks an {@code APPROVED} {@link AuraDocumentVersion}'s content and embeds each chunk, proving
 * the pgvector persistence path end to end. Only ever runs against a version the caller has
 * already approved — {@link #ingest} itself re-checks {@code status == APPROVED} (defense in
 * depth: never trust the caller alone) and fails the job cleanly, without chunking/embedding
 * anything, if that's not true.
 *
 * <p>Idempotent at the job level: re-running {@code ingest} on a version that's already
 * {@code INDEXED} is a no-op that returns a fresh {@code SUCCEEDED} job referencing the existing
 * chunk count, rather than creating duplicate chunks/embeddings (A2 requirement).
 *
 * <p>{@code errorMessage} on a failed job is a short, safe code — never the raw exception message
 * or stack trace (security baseline: no sensitive/internal detail leakage into persisted state).
 */
@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final AuraDocumentVersionRepository versionRepository;
    private final AuraChunkRepository chunkRepository;
    private final AuraEmbeddingRepository embeddingRepository;
    private final AuraIngestionJobRepository jobRepository;
    private final EmbeddingProvider embeddingProvider;
    private final ChunkingService chunkingService;
    private final int embeddingGeneration;
    private final Counter documentsProcessedCounter;
    private final Counter chunksGeneratedCounter;
    private final Counter embeddingCallsCounter;
    private final Counter embeddingFailuresCounter;

    public IngestionService(AuraDocumentVersionRepository versionRepository,
                             AuraChunkRepository chunkRepository,
                             AuraEmbeddingRepository embeddingRepository,
                             AuraIngestionJobRepository jobRepository,
                             EmbeddingProvider embeddingProvider,
                             ChunkingService chunkingService,
                             ProviderProperties providerProperties,
                             MeterRegistry meterRegistry) {
        this.versionRepository = versionRepository;
        this.chunkRepository = chunkRepository;
        this.embeddingRepository = embeddingRepository;
        this.jobRepository = jobRepository;
        this.embeddingProvider = embeddingProvider;
        this.chunkingService = chunkingService;
        this.embeddingGeneration = providerProperties.embedding().generation();
        this.documentsProcessedCounter = meterRegistry.counter("aura.ingestion.documents.processed");
        this.chunksGeneratedCounter = meterRegistry.counter("aura.ingestion.chunks.generated");
        this.embeddingCallsCounter = meterRegistry.counter("aura.ingestion.embedding.calls");
        this.embeddingFailuresCounter = meterRegistry.counter("aura.ingestion.embedding.failures");
    }

    @Transactional
    public AuraIngestionJob ingest(UUID documentVersionId) {
        AuraDocumentVersion version = versionRepository.findById(documentVersionId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown document version: " + documentVersionId));

        AuraIngestionJob job = jobRepository.save(new AuraIngestionJob(documentVersionId));

        if (version.getStatus() == DocumentStatus.INDEXED) {
            int existingChunkCount = chunkRepository.findByDocumentVersionIdOrderByChunkIndex(version.getId()).size();
            log.info("Document version {} is already INDEXED — ingest is a no-op ({} existing chunks).",
                    documentVersionId, existingChunkCount);
            job.markSucceeded(existingChunkCount);
            return jobRepository.save(job);
        }

        if (version.getStatus() != DocumentStatus.APPROVED) {
            job.markFailed("VERSION_NOT_APPROVED");
            return jobRepository.save(job);
        }

        if (!embeddingProvider.isEnabled()) {
            job.markFailed("EMBEDDING_PROVIDER_DISABLED");
            return jobRepository.save(job);
        }

        job.markRunning();
        try {
            List<PreparedChunk> prepared = chunkingService.chunk(version.getRawContent());
            int index = 0;
            for (PreparedChunk candidate : prepared) {
                AuraChunk chunk = chunkRepository.save(new AuraChunk(version.getId(), index++, candidate.text(),
                        null, candidate.sectionHeading(), candidate.charStart(), candidate.charEnd()));

                embeddingCallsCounter.increment();
                EmbeddingResult result = embeddingProvider.embed(candidate.text());
                if (result.vector().length != embeddingProvider.dimensions()) {
                    throw new ProviderPermanentException("EMBEDDING_DIMENSION_MISMATCH");
                }
                embeddingRepository.save(new AuraEmbedding(chunk.getId(), result.model(), result.provider(),
                        embeddingGeneration, result.vector()));
            }
            version.markIndexed();
            versionRepository.save(version);
            job.markSucceeded(prepared.size());
            documentsProcessedCounter.increment();
            chunksGeneratedCounter.increment(prepared.size());
        } catch (ProviderPermanentException e) {
            embeddingFailuresCounter.increment();
            job.markFailed("EMBEDDING_PROVIDER_PERMANENT_ERROR");
        } catch (ProviderTransientException e) {
            embeddingFailuresCounter.increment();
            job.markFailed("EMBEDDING_PROVIDER_TRANSIENT_ERROR");
        } catch (RuntimeException e) {
            job.markFailed("INGESTION_FAILED");
        }
        return jobRepository.save(job);
    }

    /**
     * Re-embeds an already-{@code INDEXED} version's existing chunks at the currently configured
     * embedding generation, without re-chunking and without touching the version's status or its
     * previous vectors. This is how a corpus moves onto a new provider/model cohort (A2.1's real
     * embedding calibration) while the old generation stays intact for comparison.
     *
     * <p>Idempotent: a chunk that already has a vector at this generation is skipped, so an
     * interrupted run can simply be repeated.
     */
    @Transactional
    public AuraIngestionJob reembed(UUID documentVersionId) {
        AuraDocumentVersion version = versionRepository.findById(documentVersionId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown document version: " + documentVersionId));

        AuraIngestionJob job = jobRepository.save(new AuraIngestionJob(documentVersionId));

        if (version.getStatus() != DocumentStatus.INDEXED) {
            job.markFailed("VERSION_NOT_INDEXED");
            return jobRepository.save(job);
        }
        if (!embeddingProvider.isEnabled()) {
            job.markFailed("EMBEDDING_PROVIDER_DISABLED");
            return jobRepository.save(job);
        }

        job.markRunning();
        try {
            List<AuraChunk> chunks = chunkRepository.findByDocumentVersionIdOrderByChunkIndex(documentVersionId);
            int embedded = 0;
            for (AuraChunk chunk : chunks) {
                if (embeddingRepository.existsByChunkIdAndGeneration(chunk.getId(), embeddingGeneration)) {
                    continue;
                }
                embeddingCallsCounter.increment();
                EmbeddingResult result = embeddingProvider.embed(chunk.getContent());
                if (result.vector().length != embeddingProvider.dimensions()) {
                    throw new ProviderPermanentException("EMBEDDING_DIMENSION_MISMATCH");
                }
                embeddingRepository.save(new AuraEmbedding(chunk.getId(), result.model(), result.provider(),
                        embeddingGeneration, result.vector()));
                embedded++;
            }
            job.markSucceeded(chunks.size());
            log.info("Re-embedded {} of {} chunk(s) for version {} at generation {}.",
                    embedded, chunks.size(), documentVersionId, embeddingGeneration);
        } catch (ProviderPermanentException e) {
            embeddingFailuresCounter.increment();
            job.markFailed("EMBEDDING_PROVIDER_PERMANENT_ERROR");
        } catch (ProviderTransientException e) {
            embeddingFailuresCounter.increment();
            job.markFailed("EMBEDDING_PROVIDER_TRANSIENT_ERROR");
        } catch (RuntimeException e) {
            job.markFailed("REEMBED_FAILED");
        }
        return jobRepository.save(job);
    }
}
