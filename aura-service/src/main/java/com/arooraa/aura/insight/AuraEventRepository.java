package com.arooraa.aura.insight;

import com.arooraa.aura.insight.domain.AuraEvent;
import com.arooraa.aura.insight.domain.AuraEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AuraEventRepository extends JpaRepository<AuraEvent, UUID> {

    long countByEventType(AuraEventType eventType);

    long countByEventTypeAndOccurredAtAfter(AuraEventType eventType, Instant after);

    /**
     * Answered turns grouped by mode and evidence level — the shape of "what are people asking, and
     * how often can we actually answer it", which is the first thing anyone would want to know.
     */
    @Query("""
            select e.mode, e.evidenceLevel, count(e), avg(e.latencyMs)
            from AuraEvent e
            where e.eventType = com.arooraa.aura.insight.domain.AuraEventType.MESSAGE_ANSWERED
              and e.occurredAt > :after
            group by e.mode, e.evidenceLevel
            order by count(e) desc
            """)
    List<Object[]> answeredTurnBreakdown(Instant after);

    /** Failures by kind, so a spike can be told apart from a steady trickle. */
    @Query("""
            select e.eventType, e.detail, count(e)
            from AuraEvent e
            where e.eventType in (
                    com.arooraa.aura.insight.domain.AuraEventType.PROVIDER_FAILED,
                    com.arooraa.aura.insight.domain.AuraEventType.GUARDRAIL_INTERVENED,
                    com.arooraa.aura.insight.domain.AuraEventType.VOICE_TRANSCRIPTION_FAILED,
                    com.arooraa.aura.insight.domain.AuraEventType.VOICE_SYNTHESIS_FAILED)
              and e.occurredAt > :after
            group by e.eventType, e.detail
            order by count(e) desc
            """)
    List<Object[]> failureBreakdown(Instant after);
}
