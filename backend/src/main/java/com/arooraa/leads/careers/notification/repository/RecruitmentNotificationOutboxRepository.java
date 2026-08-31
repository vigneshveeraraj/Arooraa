package com.arooraa.leads.careers.notification.repository;

import com.arooraa.leads.careers.notification.domain.RecruitmentNotificationOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecruitmentNotificationOutboxRepository extends JpaRepository<RecruitmentNotificationOutbox, UUID> {

    /** Claims (locks) the single most-due eligible row via {@code FOR UPDATE SKIP LOCKED} — see NotificationOutboxRepository's twin for the full reasoning. */
    @Query(value = """
            SELECT * FROM job_application_notification_outbox
            WHERE status IN ('PENDING', 'RETRY')
              AND next_attempt_at <= :now
            ORDER BY next_attempt_at
            LIMIT 1
            FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    Optional<RecruitmentNotificationOutbox> claimNext(@Param("now") Instant now);

    List<RecruitmentNotificationOutbox> findByJobApplicationId(UUID jobApplicationId);

    long countByJobApplicationId(UUID jobApplicationId);
}
