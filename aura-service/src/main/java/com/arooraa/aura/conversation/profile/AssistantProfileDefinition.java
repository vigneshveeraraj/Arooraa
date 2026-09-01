package com.arooraa.aura.conversation.profile;

import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;

import java.util.Set;

/**
 * Everything one Aura experience owns: who it represents, where it speaks, what it may do, and how
 * it sounds. This is the seam that keeps aura-service a common AROORAA AI platform rather than the
 * arooraa.com chatbot — a future MESA or Mindra assistant is a new definition here, not a fork of
 * the pipeline.
 *
 * <p>Knowledge access is deliberately NOT a field: it stays with {@code AccessPolicy}, which
 * resolves authorized knowledge spaces from profile + channel and is enforced in SQL. Duplicating
 * it here would create a second, weaker copy of a security boundary that already fails closed.
 *
 * @param organisation who Aura speaks for, in the visitor's words ("AROORAA")
 * @param description one line of self-description used when a visitor asks what Aura is
 */
public record AssistantProfileDefinition(
        AssistantProfile profile,
        Channel channel,
        String organisation,
        String description,
        Set<AssistantCapability> capabilities) {

    public boolean allows(AssistantCapability capability) {
        return capabilities.contains(capability);
    }
}
