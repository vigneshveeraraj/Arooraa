package com.arooraa.aura.insight;

import com.arooraa.aura.insight.domain.AuraFeedback;
import com.arooraa.aura.insight.domain.FeedbackRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuraFeedbackRepository extends JpaRepository<AuraFeedback, UUID> {

    Optional<AuraFeedback> findByConversationIdAndMessageSequence(UUID conversationId, int messageSequence);

    long countByRating(FeedbackRating rating);
}
