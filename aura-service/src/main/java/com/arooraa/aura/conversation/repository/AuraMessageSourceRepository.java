package com.arooraa.aura.conversation.repository;

import com.arooraa.aura.conversation.domain.AuraMessageSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuraMessageSourceRepository extends JpaRepository<AuraMessageSource, UUID> {

    List<AuraMessageSource> findByMessageIdOrderByPositionAsc(UUID messageId);
}
