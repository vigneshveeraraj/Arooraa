package com.arooraa.leads.project.notification.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled entry point only (W3.2C §13, §15) — every bit of transactional claim/send/finalize
 * logic lives in {@link NotificationOutboxProcessor}, called here as a genuine cross-bean call so
 * its {@code @Transactional} proxy actually applies (see that class's Javadoc). Only registered
 * when {@code arooraa.lead-notifications.enabled=true}; while disabled, outbox rows created by
 * {@link LeadNotificationService#createIntents} simply stay PENDING forever (W3.2C §47).
 */
@Component
@ConditionalOnProperty(prefix = "arooraa.lead-notifications", name = "enabled", havingValue = "true")
public class NotificationOutboxWorker {

    private final NotificationOutboxProcessor processor;
    private final int batchSize;

    public NotificationOutboxWorker(NotificationOutboxProcessor processor,
                                     @Value("${arooraa.lead-notifications.worker.batch-size:20}") int batchSize) {
        this.processor = processor;
        this.batchSize = batchSize;
    }

    @Scheduled(fixedDelayString = "#{${arooraa.lead-notifications.worker.cadence-seconds:10} * 1000}")
    public void tick() {
        for (int i = 0; i < batchSize; i++) {
            if (!processor.claimAndProcessOne()) {
                break;
            }
        }
    }
}
