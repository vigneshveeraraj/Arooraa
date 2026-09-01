package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;

/**
 * The routing outcome for one turn. Carries the confidentiality verdict alongside the mode so
 * later stages (and diagnostics) can see <em>why</em> a turn became
 * {@link ConversationMode#INTERNAL_BOUNDARY} without re-running the classifier.
 */
public record ScopeDecision(ConversationMode mode, ConfidentialityVerdict confidentiality) {
}
