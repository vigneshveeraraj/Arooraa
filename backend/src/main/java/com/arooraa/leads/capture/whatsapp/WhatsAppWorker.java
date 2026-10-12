package com.arooraa.leads.capture.whatsapp;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled entry point only — requires BOTH arooraa.whatsapp.enabled and
 * arooraa.whatsapp.worker.enabled. Safe on several instances: every claim is a row lock with
 * SKIP LOCKED plus a per-participant ordering guard, never an in-memory assumption.
 */
@Component
@ConditionalOnProperty(prefix = "arooraa.whatsapp", name = {"enabled", "worker.enabled"}, havingValue = "true")
public class WhatsAppWorker {

    private final WhatsAppInboundProcessor inbound;
    private final ObjectProvider<WhatsAppOutboundDispatcher> outbound;
    private final int batchSize;

    public WhatsAppWorker(WhatsAppInboundProcessor inbound, ObjectProvider<WhatsAppOutboundDispatcher> outbound,
                          WhatsAppProperties properties) {
        this.inbound = inbound;
        this.outbound = outbound;
        this.batchSize = properties.worker().batchSize();
    }

    @Scheduled(fixedDelayString = "${arooraa.whatsapp.worker.cadence-ms:2000}")
    public void tick() {
        for (int i = 0; i < batchSize && inbound.processOne(); i++) {
            // drain up to batchSize due inbound rows
        }
        WhatsAppOutboundDispatcher dispatcher = outbound.getIfAvailable();
        if (dispatcher != null) {
            dispatcher.recoverStaleSending();
            for (int i = 0; i < batchSize && dispatcher.dispatchOne(); i++) {
                // drain up to batchSize due outbound rows
            }
        }
    }
}
