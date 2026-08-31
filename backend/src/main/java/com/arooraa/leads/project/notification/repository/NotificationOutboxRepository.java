package com.arooraa.leads.project.notification.repository;

import com.arooraa.leads.project.notification.domain.NotificationOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationOutboxRepository extends JpaRepository<NotificationOutbox, UUID> {

    /**
     * Claims (locks) the single most-due eligible row, skipping any row another worker
     * transaction already holds locked (W3.2C §14 — Postgres {@code FOR UPDATE SKIP LOCKED},
     * no Redis, no application-level mutex). Must be called from within a transaction that
     * stays open for the whole claim+send+finalize sequence — see NotificationOutboxProcessor.
     */
    @Query(value = """
            SELECT * FROM project_enquiry_notification_outbox
            WHERE status IN ('PENDING', 'RETRY')
              AND next_attempt_at <= :now
            ORDER BY next_attempt_at
            LIMIT 1
            FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    Optional<NotificationOutbox> claimNext(@Param("now") Instant now);

    List<NotificationOutbox> findByProjectEnquiryId(UUID projectEnquiryId);

    long countByProjectEnquiryId(UUID projectEnquiryId);
}
