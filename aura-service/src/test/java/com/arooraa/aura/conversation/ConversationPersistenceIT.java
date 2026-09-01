package com.arooraa.aura.conversation;

import com.arooraa.aura.conversation.domain.AuraConversation;
import com.arooraa.aura.conversation.domain.AuraMessage;
import com.arooraa.aura.conversation.domain.MessageRole;
import com.arooraa.aura.conversation.repository.AuraConversationRepository;
import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import com.arooraa.aura.provider.stub.StubChatGenerationProvider;
import com.arooraa.aura.provider.stub.StubEmbeddingProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The A3.2 persistence regression, against real JPA and real Postgres rather than a mock.
 *
 * <p>Exists because the real-provider run failed on its <em>second</em> turn with
 * {@code ObjectOptimisticLockingFailureException} and the secretless suite did not notice. It could
 * not: every HTTP test sends each turn as a separate request, and a fresh request happened to
 * reload the conversation, which hid the fact that the orchestrator was re-saving an entity from a
 * transaction that had already committed. The real script holds one conversation and talks to it
 * repeatedly — so that is what these tests do too.
 *
 * <p>The last two tests are the other half of the fix, and matter just as much: the defect must be
 * gone <em>without</em> optimistic locking having been weakened to achieve it.
 */
@Testcontainers
@SpringBootTest
class ConversationPersistenceIT {

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
    static class StubProviders {
        @Bean
        @Primary
        EmbeddingProvider stubEmbeddingProvider() {
            return new StubEmbeddingProvider();
        }

        @Bean
        @Primary
        ChatGenerationProvider stubChatGenerationProvider() {
            return new StubChatGenerationProvider();
        }
    }

    @Autowired
    private ConversationService conversationService;
    @Autowired
    private ConversationOrchestrator orchestrator;
    @Autowired
    private AuraConversationRepository conversationRepository;

    @Test
    void threeSequentialTurnsInOneConversationAllPersist() {
        // The exact sequence from the defect report: turn one used to work and turn two used to
        // blow up on the conversation row.
        UUID conversation = conversationService.open(null).getPublicId();

        orchestrator.respond(conversation, "Hi Aura", null);
        orchestrator.respond(conversation, "What is MESA?", null);
        orchestrator.respond(conversation, "And what would it cost to try it?", null);

        List<AuraMessage> transcript = orchestrator.transcript(conversation);
        assertEquals(6, transcript.size(), "three turns is three questions and three answers");
        for (int i = 0; i < transcript.size(); i++) {
            assertEquals(i, transcript.get(i).getSequence(), "sequence must stay dense and in order");
            assertEquals(i % 2 == 0 ? MessageRole.USER : MessageRole.ASSISTANT, transcript.get(i).getRole());
        }
        assertEquals("Hi Aura", transcript.get(0).getContent());
        assertEquals("What is MESA?", transcript.get(2).getContent());
        assertEquals("And what would it cost to try it?", transcript.get(4).getContent());
    }

    @Test
    void aCallerMayHoldOneConversationObjectAcrossManyTurns() {
        // The shape of the real-provider script, which is what actually broke: open once, keep the
        // object, keep talking. Nothing the caller holds is used to write any more, so an object as
        // stale as this one now is stays harmless.
        AuraConversation opened = conversationService.open(null);
        long versionAsOpened = versionOf(opened.getPublicId());

        for (int turn = 1; turn <= 5; turn++) {
            orchestrator.respond(opened.getPublicId(), "Turn number " + turn + ", still the same chat.", null);
        }

        assertEquals(10, orchestrator.transcript(opened.getPublicId()).size());
        assertTrue(versionOf(opened.getPublicId()) > versionAsOpened,
                "each turn should still advance the conversation's version");
    }

    @Test
    void aNewConversationStartsWithAnEmptyTranscript() {
        UUID first = conversationService.open(null).getPublicId();
        orchestrator.respond(first, "I own three restaurants.", null);
        orchestrator.respond(first, "Two are cafés and one is a cloud kitchen.", null);

        UUID second = conversationService.open(null).getPublicId();

        assertEquals(4, orchestrator.transcript(first).size());
        assertTrue(orchestrator.transcript(second).isEmpty(), "conversations must not share memory");
    }

    @Test
    void anUnknownConversationIsRejectedRatherThanCreated() {
        UUID never = UUID.randomUUID();

        assertThrows(UnknownConversationException.class, () -> orchestrator.respond(never, "Hello?", null));
        assertTrue(conversationRepository.findByPublicId(never).isEmpty());
    }

    @Test
    void everyTurnAdvancesTheVersionSoOptimisticLockingHasSomethingToCompare() {
        UUID conversation = conversationService.open(null).getPublicId();
        long before = versionOf(conversation);

        orchestrator.respond(conversation, "Hello", null);
        long afterOne = versionOf(conversation);
        orchestrator.respond(conversation, "What is MESA?", null);
        long afterTwo = versionOf(conversation);

        assertEquals(before + 1, afterOne, "a turn must be a write, or @Version is decorative");
        assertEquals(afterOne + 1, afterTwo);
    }

    @Test
    void aStaleWriteIsStillRejected() {
        // The guarantee that must survive the fix. Two independent loads of the same row, both
        // modified, both saved: the second is working from a version that no longer exists and
        // Postgres/Hibernate must refuse it rather than silently overwrite the first.
        UUID conversation = conversationService.open(null).getPublicId();
        AuraConversation first = conversationRepository.findByPublicId(conversation).orElseThrow();
        AuraConversation second = conversationRepository.findByPublicId(conversation).orElseThrow();

        first.touch();
        conversationRepository.saveAndFlush(first);

        second.touch();
        assertThrows(ObjectOptimisticLockingFailureException.class,
                () -> conversationRepository.saveAndFlush(second),
                "optimistic locking must still reject a write built on a version that has moved on");
    }

    @Test
    void concurrentTurnsOnTheSameConversationNeverCorruptTheTranscript() throws Exception {
        // Two turns racing. Either both land (one after the other) or one is rejected — by the
        // version check or by the per-conversation sequence uniqueness. What must never happen is a
        // half-written turn or two messages claiming the same position, so that is what is asserted
        // rather than a particular winner. Note there is no retry: a rejected turn stays rejected.
        UUID conversation = conversationService.open(null).getPublicId();
        int racers = 4;
        ExecutorService pool = Executors.newFixedThreadPool(racers);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger succeeded = new AtomicInteger();

        try {
            List<Future<?>> futures = new ArrayList<>();
            for (int i = 0; i < racers; i++) {
                int index = i;
                futures.add(pool.submit(() -> {
                    start.await();
                    try {
                        orchestrator.respond(conversation, "Simultaneous message " + index, null);
                        succeeded.incrementAndGet();
                    } catch (RuntimeException expectedForLosers) {
                        // A loser rolls back entirely; that is the protection working.
                    }
                    return null;
                }));
            }
            start.countDown();
            for (Future<?> future : futures) {
                future.get(60, TimeUnit.SECONDS);
            }
        } finally {
            pool.shutdownNow();
        }

        assertTrue(succeeded.get() >= 1, "at least one concurrent turn should have been answered");

        List<AuraMessage> transcript = orchestrator.transcript(conversation);
        assertEquals(succeeded.get() * 2, transcript.size(),
                "a rejected turn must leave nothing behind, not half a turn");
        Set<Integer> sequences = new HashSet<>();
        for (int i = 0; i < transcript.size(); i++) {
            assertTrue(sequences.add(transcript.get(i).getSequence()),
                    "two messages claimed the same position: " + transcript.get(i).getSequence());
            assertEquals(i, transcript.get(i).getSequence(), "the transcript must have no holes");
        }
    }

    private long versionOf(UUID publicId) {
        return conversationRepository.findByPublicId(publicId).orElseThrow().getVersion();
    }
}
