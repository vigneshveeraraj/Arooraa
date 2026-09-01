package com.arooraa.aura.ingestion;

import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.AuraEmbedding;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.knowledge.repository.AuraEmbeddingRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.EmbeddingResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Chunks an approved {@link AuraDocumentVersion}'s content and embeds each chunk, proving the
 * pgvector persistence path end to end. Deliberately minimal — this is the foundation the future
 * ingestion/re-indexing workflow builds on, not that workflow itself (no scheduling, no batching
 * across documents, no partial-failure retry). Never runs against unreviewed content: the caller
 * is responsible for only ingesting an {@code APPROVED} version.
 *
 * <p>{@code errorMessage} on a failed job is a short, safe code — never the raw exception message
 * or stack trace (security baseline: no sensitive/internal detail leakage into persisted state).
 */
@Service
public class IngestionService {

    private final AuraDocumentVersionRepository versionRepository;
    private final AuraChunkRepository chunkRepository;
    private final AuraEmbeddingRepository embeddingRepository;
    private final AuraIngestionJobRepository jobRepository;
    private final EmbeddingProvider embeddingProvider;
    private final ChunkingService chunkingService;

    public IngestionService(AuraDocumentVersionRepository versionRepository,
                             AuraChunkRepository chunkRepository,
                             AuraEmbeddingRepository embeddingRepository,
                             AuraIngestionJobRepository jobRepository,
                             EmbeddingProvider embeddingProvider,
                             ChunkingService chunkingService) {
        this.versionRepository = versionRepository;
        this.chunkRepository = chunkRepository;
        this.embeddingRepository = embeddingRepository;
        this.jobRepository = jobRepository;
        this.embeddingProvider = embeddingProvider;
        this.chunkingService = chunkingService;
    }

    @Transactional
    public AuraIngestionJob ingest(UUID documentVersionId) {
        AuraDocumentVersion version = versionRepository.findById(documentVersionId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown document version: " + documentVersionId));

        AuraIngestionJob job = jobRepository.save(new AuraIngestionJob(documentVersionId));

        if (!embeddingProvider.isEnabled()) {
            job.markFailed("EMBEDDING_PROVIDER_DISABLED");
            return jobRepository.save(job);
        }

        job.markRunning();
        try {
            List<String> chunkTexts = chunkingService.chunk(version.getRawContent());
            int index = 0;
            for (String text : chunkTexts) {
                AuraChunk chunk = chunkRepository.save(new AuraChunk(version.getId(), index++, text, null));
                EmbeddingResult result = embeddingProvider.embed(text);
                embeddingRepository.save(new AuraEmbedding(chunk.getId(), result.model(), result.vector()));
            }
            version.markIndexed();
            versionRepository.save(version);
            job.markSucceeded(chunkTexts.size());
        } catch (RuntimeException e) {
            job.markFailed("INGESTION_FAILED");
        }
        return jobRepository.save(job);
    }
}
