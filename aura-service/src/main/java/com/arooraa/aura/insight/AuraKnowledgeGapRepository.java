package com.arooraa.aura.insight;

import com.arooraa.aura.insight.domain.AuraKnowledgeGap;
import com.arooraa.aura.insight.domain.GapStatus;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuraKnowledgeGapRepository extends JpaRepository<AuraKnowledgeGap, UUID> {

    Optional<AuraKnowledgeGap> findByFingerprint(String fingerprint);

    /** Most-asked first: the order somebody filling gaps would want to work in. */
    List<AuraKnowledgeGap> findByStatusOrderByOccurrencesDesc(GapStatus status, Limit limit);

    long countByStatus(GapStatus status);
}
