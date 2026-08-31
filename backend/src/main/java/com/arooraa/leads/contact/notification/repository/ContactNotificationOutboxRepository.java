package com.arooraa.leads.contact.notification.repository;

import com.arooraa.leads.contact.notification.domain.ContactNotificationOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContactNotificationOutboxRepository extends JpaRepository<ContactNotificationOutbox, UUID> {

    @Query(value = """
            SELECT * FROM contact_message_notification_outbox
            WHERE status IN ('PENDING', 'RETRY')
              AND next_attempt_at <= :now
            ORDER BY next_attempt_at
            LIMIT 1
            FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    Optional<ContactNotificationOutbox> claimNext(@Param("now") Instant now);

    List<ContactNotificationOutbox> findByContactMessageId(UUID contactMessageId);

    long countByContactMessageId(UUID contactMessageId);
}
