package com.arooraa.aura.retention;

import com.arooraa.aura.conversation.domain.AuraConversation;
import com.arooraa.aura.conversation.repository.AuraConversationRepository;
import com.arooraa.aura.conversation.repository.AuraMessageRepository;
import com.arooraa.aura.insight.AuraEventRepository;
import com.arooraa.aura.insight.domain.AuraEvent;
import com.arooraa.aura.insight.domain.AuraEventType;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * What Aura throws away, and what it deliberately keeps (A8).
 *
 * <p>Run against a real database because the whole design leans on the schema: the cascade that
 * takes a conversation's messages, brief and feedback with it, and the V7 change that severs an
 * event's link instead of deleting it. Both are database behaviour, and neither would be exercised
 * by a test of this class alone.
 */
@Testcontainers
@SpringBootTest(properties = {
        "aura.retention.conversation-days=90",
        "aura.retention.event-days=365"
})
class RetentionIT {

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

    @TestConfiguration
    static class Stubs {
        @Bean
        @Primary
        EmbeddingProvider stubEmbeddingProvider() {
            return new StubEmbeddingProvider();
        }
    }

    @Autowired
    private RetentionService retention;
    @Autowired
    private AuraConversationRepository conversations;
    @Autowired
    private AuraMessageRepository messages;
    @Autowired
    private AuraEventRepository events;
    @Autowired
    private JdbcTemplate jdbc;

    private static final Instant NOW = Instant.parse("2026-09-03T00:00:00Z");

    @BeforeEach
    void setUp() {
        jdbc.update("DELETE FROM aura_events");
        jdbc.update("DELETE FROM aura_conversations");
    }

    /** A conversation with one message, aged by writing the timestamps the sweep reads. */
    private UUID conversationAged(int days) {
        AuraConversation conversation = conversations.save(
                new AuraConversation("AROORAA_WEBSITE", "PUBLIC_WEB"));
        UUID id = conversation.getId();
        jdbc.update("INSERT INTO aura_messages (id, conversation_id, sequence, role, content, created_at) "
                        + "VALUES (?, ?, 0, 'USER', 'I have an app idea.', ?)",
                UUID.randomUUID(), id, java.sql.Timestamp.from(NOW.minus(days, ChronoUnit.DAYS)));
        jdbc.update("UPDATE aura_conversations SET updated_at = ? WHERE id = ?",
                java.sql.Timestamp.from(NOW.minus(days, ChronoUnit.DAYS)), id);
        return id;
    }

    private void eventAged(UUID conversationId, int days) {
        events.save(AuraEvent.of(AuraEventType.MESSAGE_ANSWERED, conversationId)
                .withRouting("GROUNDED_QA", "STRONG_EVIDENCE", "ENGLISH", "PUBLIC_WEB")
                .withLatency(1200L));
        jdbc.update("UPDATE aura_events SET occurred_at = ? WHERE occurred_at > ?",
                java.sql.Timestamp.from(NOW.minus(days, ChronoUnit.DAYS)),
                java.sql.Timestamp.from(NOW.minus(1, ChronoUnit.DAYS)));
    }

    @Test
    void removesAConversationPastItsWindowAndEverythingOnlyReadableWithIt() {
        UUID old = conversationAged(120);

        retention.deleteExpired(NOW);

        assertFalse(conversations.findById(old).isPresent());
        // The messages went with it, by the schema's cascade rather than by a second delete here.
        assertTrue(messages.findByConversationIdOrderBySequenceAsc(old).isEmpty());
    }

    @Test
    void keepsAConversationInsideItsWindow() {
        UUID recent = conversationAged(30);

        retention.deleteExpired(NOW);

        assertTrue(conversations.findById(recent).isPresent());
    }

    @Test
    void keepsTheCountsWhenTheConversationTheyCameFromIsDeleted() {
        // The V7 change, and the reason for it: the question these rows answer — is Aura getting
        // better or worse — is asked across seasons, and cascading meant it could never reach
        // further back than a conversation is kept.
        UUID old = conversationAged(120);
        eventAged(old, 120);
        long before = events.count();

        retention.deleteExpired(NOW);

        assertEquals(before, events.count());
        // And the link is gone, which is also the more private outcome: there is nothing left to
        // group it back to, and nothing should pretend otherwise.
        Integer stillLinked = jdbc.queryForObject(
                "SELECT count(*) FROM aura_events WHERE conversation_id = ?", Integer.class, old);
        assertEquals(0, stillLinked);
    }

    @Test
    void removesAnEventPastItsOwnLongerWindow() {
        eventAged(null, 400);

        retention.deleteExpired(NOW);

        assertEquals(0, events.count());
    }

    @Test
    void deletesNothingWhenRetentionIsSwitchedOff() {
        RetentionService off = new RetentionService(new RetentionProperties(false, 90, 365));

        // Reaching the switch is the whole test: sweep() consults it before touching anything, so
        // an operator who turned retention off does not lose data to a scheduled task.
        UUID old = conversationAged(120);
        off.sweep();

        assertTrue(conversations.findById(old).isPresent());
    }
}
