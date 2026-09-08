package com.arooraa.aura.conversation.pipeline;

/**
 * What this turn is allowed to produce. Computed before composition so the prompt states one
 * coherent set of permissions, and reused afterwards by the guardrail — the same decision both
 * instructs generation and validates it, so the two can never drift apart.
 *
 * @param groundingAllowed the answer may state AROORAA-specific facts, because approved evidence
 *        supporting them is attached
 * @param mustQualify evidence exists but is weak — answer the supported part and be openly
 *        uncertain about the rest, or ask a clarifying question instead
 * @param forbidArooraaFactualClaims no AROORAA-specific claim may be made at all: either nothing
 *        was retrieved, or this turn deliberately runs on general knowledge. This is the rule that
 *        stops "a system like this could use caching" from becoming "AROORAA uses Redis"
 * @param humourAllowed light humour is appropriate here (see {@code ConversationTone})
 * @param includeSources the response may carry public source references
 * @param externalReferencesAllowed the answer may name an outside commercial destination — a
 *        teaching platform, a freelancer marketplace, an agency, a competing product. False
 *        almost always, and true only when the visitor explicitly asked to be pointed somewhere.
 *        This is the rule that stops "help me learn to code" being answered with a list of other
 *        companies; see {@link ExternalRecommendation} for why it is a permission rather than a
 *        line in the prompt
 */
public record GenerationDecision(
        boolean groundingAllowed,
        boolean mustQualify,
        boolean forbidArooraaFactualClaims,
        boolean humourAllowed,
        boolean includeSources,
        boolean externalReferencesAllowed) {
}
