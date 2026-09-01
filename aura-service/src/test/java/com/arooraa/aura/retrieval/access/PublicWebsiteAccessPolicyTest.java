package com.arooraa.aura.retrieval.access;

import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;
import com.arooraa.aura.retrieval.context.KnowledgeSpace;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PublicWebsiteAccessPolicyTest {

    private final PublicWebsiteAccessPolicy policy = new PublicWebsiteAccessPolicy();

    @Test
    void theArooraaWebsitePublicWebChannelIsAuthorizedForTheArooraaPublicSpaceOnly() {
        Set<String> spaces = policy.authorizedKnowledgeSpaces(AssistantProfile.AROORAA_WEBSITE, Channel.PUBLIC_WEB);

        assertEquals(Set.of(KnowledgeSpace.AROORAA_PUBLIC), spaces);
    }

    @Test
    void anUnrecognizedProfileIsUnauthorizedByDefaultRatherThanGrantedBroadAccess() {
        Set<String> spaces = policy.authorizedKnowledgeSpaces(new AssistantProfile("MESA_AURA"), Channel.PUBLIC_WEB);

        assertTrue(spaces.isEmpty(), "fail-closed: an unrecognized profile must not be granted any knowledge space");
    }

    @Test
    void anUnrecognizedChannelIsUnauthorizedByDefault() {
        Set<String> spaces = policy.authorizedKnowledgeSpaces(AssistantProfile.AROORAA_WEBSITE, new Channel("AUTHENTICATED_APP"));

        assertTrue(spaces.isEmpty());
    }
}
