package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;

/**
 * The routing outcome for one turn. Carries the confidentiality verdict alongside the mode so
 * later stages (and diagnostics) can see <em>why</em> a turn became
 * {@link ConversationMode#INTERNAL_BOUNDARY} without re-running the classifier.
 *
 * @param mentionsOrganisationSubject whether the message named AROORAA or one of its products.
 *        The mode alone cannot answer "should this turn search?" for
 *        {@link ConversationMode#PROJECT_DISCOVERY}: "I have an app idea" has nothing to look up,
 *        while "I have an app idea — what services can AROORAA provide?" does. Measured once here,
 *        where the vocabulary lives, rather than re-derived by {@link RetrievalPlanner}.
 */
public record ScopeDecision(ConversationMode mode, ConfidentialityVerdict confidentiality,
                             boolean mentionsOrganisationSubject) {
}
