package com.arooraa.aura.retrieval.access;

import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;

import java.util.Set;

/**
 * Decides which knowledge spaces a given (profile, channel) pair may retrieve from — the
 * extension point that keeps "common Aura platform" from meaning "common searchable data" (A2
 * frozen requirement). Fail-closed by contract: an implementation that doesn't recognize the pair
 * must return an empty set, never guess broad access.
 */
public interface AccessPolicy {

    Set<String> authorizedKnowledgeSpaces(AssistantProfile profile, Channel channel);
}
