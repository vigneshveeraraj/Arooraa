package com.arooraa.aura;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.RerankingProvider;
import com.arooraa.aura.provider.disabled.DisabledChatGenerationProvider;
import com.arooraa.aura.provider.disabled.DisabledEmbeddingProvider;
import com.arooraa.aura.provider.disabled.DisabledRerankingProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Proves the acceptance-gate foundation: the application starts successfully — Flyway migrates
 * V1 (pgvector extension + full schema) cleanly against a real Postgres — with zero AI provider
 * configuration present, zero secrets, and the production-safe disabled providers wired in.
 */
@Testcontainers
@SpringBootTest
class AuraServiceApplicationIT {

    @Container
    static PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("pgvector/pgvector:pg16")
            .withStartupTimeout(java.time.Duration.ofMinutes(5))
            .withDatabaseName("arooraa_aura")
            .withUsername("arooraa_aura_app")
            .withPassword("integration-test-password");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ChatGenerationProvider chatGenerationProvider;

    @Autowired
    private EmbeddingProvider embeddingProvider;

    @Autowired
    private RerankingProvider rerankingProvider;

    @Test
    void applicationContextStartsWithNoAiProviderConfigured() {
        // Reaching this point already proves the context loaded; the assertions below add
        // specific, named proof rather than relying on "no exception thrown".
        assertInstanceOf(DisabledChatGenerationProvider.class, chatGenerationProvider);
        assertInstanceOf(DisabledEmbeddingProvider.class, embeddingProvider);
        assertInstanceOf(DisabledRerankingProvider.class, rerankingProvider);
    }

    @Test
    void flywayMigratedTheFullSchemaSuccessfully() {
        // Not pinned to an exact migration count — a hardcoded number here breaks every time a
        // milestone adds a forward migration (it already did twice: A2 added V2, A2.1 added V3).
        // The invariant is: nothing failed, and every migration this build ships is present and
        // applied — checked by version number, which only grows monotonically and never needs
        // updating for an unrelated schema change.
        Integer failedCount = jdbcTemplate.queryForObject(
                "select count(*) from flyway_schema_history where success = false", Integer.class);
        assertEquals(0, failedCount);

        for (String version : new String[]{"1", "2", "3", "4"}) {
            Integer applied = jdbcTemplate.queryForObject(
                    "select count(*) from flyway_schema_history where success = true and version = ?",
                    Integer.class, version);
            assertEquals(1, applied, "expected migration V" + version + " to be applied");
        }

        for (String table : new String[]{
                "aura_documents", "aura_document_versions", "aura_chunks", "aura_embeddings", "aura_ingestion_jobs"}) {
            Integer exists = jdbcTemplate.queryForObject(
                    "select count(*) from information_schema.tables where table_name = ?", Integer.class, table);
            assertEquals(1, exists, table + " should exist after migration");
        }
    }

    @Test
    void pgvectorExtensionIsInstalled() {
        Integer extensionCount = jdbcTemplate.queryForObject(
                "select count(*) from pg_extension where extname = 'vector'", Integer.class);
        assertEquals(1, extensionCount);
    }

    @Test
    void noTenantOrUserConceptExistsInTheSchema() {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from information_schema.tables where table_schema = 'public' "
                        + "and (table_name ilike '%tenant%' or table_name ilike '%user%')",
                Integer.class);
        assertEquals(0, count, "no tenant/user table should exist in A0/A1 — none is justified yet");
    }
}
