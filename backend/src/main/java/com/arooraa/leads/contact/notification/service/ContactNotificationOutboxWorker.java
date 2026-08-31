package com.arooraa.leads.contact.notification.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Scheduled entry point only — see ContactNotificationOutboxProcessor for the transactional logic. */
@Component
@ConditionalOnProperty(prefix = "arooraa.contact-notifications", name = "enabled", havingValue = "true")
public class ContactNotificationOutboxWorker {

    private final ContactNotificationOutboxProcessor processor;
    private final int batchSize;

    public ContactNotificationOutboxWorker(ContactNotificationOutboxProcessor processor,
                                            @Value("${arooraa.contact-notifications.worker.batch-size:20}") int batchSize) {
        this.processor = processor;
        this.batchSize = batchSize;
    }

    @Scheduled(fixedDelayString = "#{${arooraa.contact-notifications.worker.cadence-seconds:10} * 1000}")
    public void tick() {
        for (int i = 0; i < batchSize; i++) {
            if (!processor.claimAndProcessOne()) {
                break;
            }
        }
    }
}
