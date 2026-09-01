package com.arooraa.aura.conversation.profile;

import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Map;
import java.util.Optional;

/**
 * Pipeline stage 2. Resolves a profile code to its definition, and fails closed on anything it
 * doesn't recognise: an unknown profile must never quietly fall back to the website assistant's
 * (broadest) capabilities, since that would turn a typo into a privilege grant.
 *
 * <p>A3 defines exactly one profile. The registry shape exists so adding the second one is a map
 * entry rather than a redesign.
 */
@Component
public class AssistantProfileResolver {

    public static final AssistantProfileDefinition AROORAA_WEBSITE = new AssistantProfileDefinition(
            AssistantProfile.AROORAA_WEBSITE,
            Channel.PUBLIC_WEB,
            "AROORAA",
            "AROORAA's digital assistant on arooraa.com",
            EnumSet.allOf(AssistantCapability.class));

    private final Map<String, AssistantProfileDefinition> byCode =
            Map.of(AROORAA_WEBSITE.profile().code(), AROORAA_WEBSITE);

    public Optional<AssistantProfileDefinition> resolve(String profileCode) {
        return Optional.ofNullable(byCode.get(profileCode));
    }

    /** The profile a conversation opened without an explicit choice belongs to. */
    public AssistantProfileDefinition defaultProfile() {
        return AROORAA_WEBSITE;
    }
}
