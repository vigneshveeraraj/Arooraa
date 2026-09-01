package com.arooraa.aura.ingestion;

import com.arooraa.aura.knowledge.domain.AuraChunk;
import com.arooraa.aura.knowledge.domain.AuraDocumentVersion;
import com.arooraa.aura.knowledge.domain.AuraEmbedding;
import com.arooraa.aura.knowledge.domain.ProductStatus;
import com.arooraa.aura.knowledge.domain.Visibility;
import com.arooraa.aura.knowledge.repository.AuraChunkRepository;
import com.arooraa.aura.knowledge.repository.AuraDocumentVersionRepository;
import com.arooraa.aura.knowledge.repository.AuraEmbeddingRepository;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.EmbeddingResult;
import com.arooraa.aura.provider.ProviderDisabledException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Pure unit coverage of the pipeline decision logic — no Spring context, no DB. */
class IngestionServiceTest {

    private AuraDocumentVersionRepository versionRepository;
    private AuraChunkRepository chunkRepository;
    private AuraEmbeddingRepository embeddingRepository;
    private AuraIngestionJobRepository jobRepository;
    private EmbeddingProvider embeddingProvider;
    private IngestionService service;

    @BeforeEach
    void setUp() {
        versionRepository = mock(AuraDocumentVersionRepository.class);
        chunkRepository = mock(AuraChunkRepository.class);
        embeddingRepository = mock(AuraEmbeddingRepository.class);
        jobRepository = mock(AuraIngestionJobRepository.class);
        embeddingProvider = mock(EmbeddingProvider.class);
        service = new IngestionService(versionRepository, chunkRepository, embeddingRepository,
                jobRepository, embeddingProvider, new ChunkingService());

        when(jobRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(chunkRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(versionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private static AuraDocumentVersion sampleVersion() {
        return new AuraDocumentVersion(UUID.randomUUID(), 1, Visibility.PUBLIC, null, null, "Approved content to ingest.");
    }

    @Test
    void unknownDocumentVersionIsRejected() {
        UUID id = UUID.randomUUID();
        when(versionRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.ingest(id));
    }

    @Test
    void disabledEmbeddingProviderFailsTheJobCleanlyAndPersistsNothing() {
        AuraDocumentVersion version = sampleVersion();
        when(versionRepository.findById(version.getId())).thenReturn(Optional.of(version));
        when(embeddingProvider.isEnabled()).thenReturn(false);

        AuraIngestionJob job = service.ingest(version.getId());

        assertEquals(IngestionJobStatus.FAILED, job.getStatus());
        assertEquals("EMBEDDING_PROVIDER_DISABLED", job.getErrorMessage());
        verify(chunkRepository, never()).save(any());
        verify(embeddingRepository, never()).save(any());
        verify(versionRepository, never()).save(any());
    }

    @Test
    void enabledProviderChunksEmbedsAndMarksTheVersionIndexed() {
        AuraDocumentVersion version = sampleVersion();
        when(versionRepository.findById(version.getId())).thenReturn(Optional.of(version));
        when(embeddingProvider.isEnabled()).thenReturn(true);
        when(embeddingProvider.embed(any())).thenReturn(new EmbeddingResult(new float[]{0.1f, 0.2f}, "stub-model"));

        AuraIngestionJob job = service.ingest(version.getId());

        assertEquals(IngestionJobStatus.SUCCEEDED, job.getStatus());
        assertEquals(1, job.getChunkCount());
        verify(chunkRepository, times(1)).save(any(AuraChunk.class));
        verify(embeddingRepository, times(1)).save(any(AuraEmbedding.class));
        verify(versionRepository).save(version);
    }

    @Test
    void providerFailureDuringEmbeddingFailsTheJobWithoutLeakingProviderDetail() {
        AuraDocumentVersion version = sampleVersion();
        when(versionRepository.findById(version.getId())).thenReturn(Optional.of(version));
        when(embeddingProvider.isEnabled()).thenReturn(true);
        when(embeddingProvider.embed(any())).thenThrow(new ProviderDisabledException("some internal provider detail"));

        AuraIngestionJob job = service.ingest(version.getId());

        assertEquals(IngestionJobStatus.FAILED, job.getStatus());
        assertEquals("INGESTION_FAILED", job.getErrorMessage());
    }
}
