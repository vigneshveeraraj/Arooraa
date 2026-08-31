package com.arooraa.leads.project.notification.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Covers only the {@code @Scheduled} batch loop / delegation (W3.2C §13, §15) — the per-row
 * claim/send/finalize logic itself lives in, and is tested by, NotificationOutboxProcessorTest.
 * The processor is mocked here specifically so this test proves {@code tick()} calls it as a
 * genuine dependency-injected collaborator, not a same-class self-invocation (see
 * NotificationOutboxProcessor's Javadoc for why that distinction matters for @Transactional).
 */
class NotificationOutboxWorkerTest {

    private NotificationOutboxProcessor processor;
    private NotificationOutboxWorker worker;

    @BeforeEach
    void setUp() {
        processor = mock(NotificationOutboxProcessor.class);
    }

    @Test
    void tickStopsAtTheFirstEmptyClaimWithoutExceedingBatchSize() {
        worker = new NotificationOutboxWorker(processor, 20);
        when(processor.claimAndProcessOne()).thenReturn(true, true, true, false);

        worker.tick();

        verify(processor, times(4)).claimAndProcessOne();
    }

    @Test
    void tickNeverClaimsMoreThanTheConfiguredBatchSizeEvenIfMoreRowsRemainEligible() {
        worker = new NotificationOutboxWorker(processor, 3);
        when(processor.claimAndProcessOne()).thenReturn(true);

        worker.tick();

        verify(processor, times(3)).claimAndProcessOne();
    }
}
