package com.arooraa.aura;

import com.arooraa.aura.config.AuraSafetyProperties;
import com.arooraa.aura.ingestion.config.ChunkingProperties;
import com.arooraa.aura.retrieval.config.RetrievalProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Aura — AROORAA's conversational digital representative. A dedicated service, deliberately
 * separate from {@code lead-service}: its own application, its own database, its own deployment
 * unit (see this module's ARCHITECTURE.md). A0/A1 shipped the architecture foundation; A2 adds
 * knowledge import/approval, deterministic chunking, one real embedding provider adapter, and
 * hybrid (vector + lexical) retrieval with an evidence gate. Still no chat/public HTTP surface —
 * retrieval is proven via tests, not an endpoint (see the A2 final report).
 */
@SpringBootApplication
@EnableConfigurationProperties({AuraSafetyProperties.class, ChunkingProperties.class, RetrievalProperties.class})
public class AuraServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuraServiceApplication.class, args);
    }
}
