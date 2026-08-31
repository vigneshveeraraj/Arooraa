package com.arooraa.leads.careers.notification.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled entry point only — all transactional claim/send/finalize logic lives in
 * {@link RecruitmentNotificationOutboxProcessor}. Only registered when
 * {@code arooraa.recruitment-notifications.enabled=true}; while disabled, outbox rows created
 * by {@link JobApplicationNotificationService#createIntents} simply stay PENDING forever —
 * applications persist normally either way (W3.3B §14).
 */
@Component
@ConditionalOnProperty(prefix = "arooraa.recruitment-notifications", name = "enabled", havingValue = "true")
public class RecruitmentNotificationOutboxWorker {

    private final RecruitmentNotificationOutboxProcessor processor;
    private final int batchSize;

    public RecruitmentNotificationOutboxWorker(RecruitmentNotificationOutboxProcessor processor,
                                                @Value("${arooraa.recruitment-notifications.worker.batch-size:20}") int batchSize) {
        this.processor = processor;
        this.batchSize = batchSize;
    }

    @Scheduled(fixedDelayString = "#{${arooraa.recruitment-notifications.worker.cadence-seconds:10} * 1000}")
    public void tick() {
        for (int i = 0; i < batchSize; i++) {
            if (!processor.claimAndProcessOne()) {
                break;
            }
        }
    }
}
