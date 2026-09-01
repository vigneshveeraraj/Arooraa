package com.arooraa.aura.conversation.repository;

import com.arooraa.aura.conversation.domain.AuraConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuraConversationRepository extends JpaRepository<AuraConversation, UUID> {

    /** The only lookup the API layer may use — clients never see the surrogate primary key. */
    Optional<AuraConversation> findByPublicId(UUID publicId);
}
