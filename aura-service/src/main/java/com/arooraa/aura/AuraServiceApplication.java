package com.arooraa.aura;

import com.arooraa.aura.bootstrap.BootstrapProperties;
import com.arooraa.aura.config.AuraSafetyProperties;
import com.arooraa.aura.conversation.config.ChatProperties;
import com.arooraa.aura.ingestion.config.ChunkingProperties;
import com.arooraa.aura.retrieval.config.RetrievalProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Aura — AROORAA's conversational digital representative. A dedicated service, deliberately
 * separate from {@code lead-service}: its own application, its own database, its own deployment
 * unit (see this module's ARCHITECTURE.md). A0/A1 shipped the architecture foundation; A2 added
 * knowledge import/approval, deterministic chunking, a real embedding adapter and hybrid retrieval;
 * A2.1/A2.2 calibrated the evidence gate against real embeddings; A3 makes Aura speak — the
 * conversation pipeline, a real chat adapter, and a local-only chat surface.
 *
 * <p>That surface is off unless {@code aura.chat.enabled=true}: with no configuration at all this
 * service still starts, stays healthy, and exposes nothing but its health endpoint.
 */
@SpringBootApplication
@EnableConfigurationProperties({AuraSafetyProperties.class, BootstrapProperties.class, ChatProperties.class,
        ChunkingProperties.class, RetrievalProperties.class})
public class AuraServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuraServiceApplication.class, args);
    }
}
