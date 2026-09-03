package com.arooraa.aura.discovery;

import com.arooraa.aura.discovery.domain.ProjectBrief;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * There is deliberately no {@code findById} in use anywhere: a brief is only ever reached through
 * the conversation it belongs to, so no caller can address one without already holding the
 * conversation it came from.
 */
public interface ProjectBriefRepository extends JpaRepository<ProjectBrief, UUID> {

    Optional<ProjectBrief> findByConversationId(UUID conversationId);
}
