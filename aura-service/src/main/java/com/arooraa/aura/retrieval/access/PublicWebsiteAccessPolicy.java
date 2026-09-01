package com.arooraa.aura.retrieval.access;

import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;
import com.arooraa.aura.retrieval.context.KnowledgeSpace;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * A2's one {@link AccessPolicy}: the arooraa.com public website widget may retrieve only from the
 * {@code AROORAA_PUBLIC} knowledge space. Any other (profile, channel) pair — including ones that
 * don't exist yet (MESA Aura, an authenticated channel, ...) — is unauthorized by default
 * (fail-closed), not because it's explicitly denied but because nothing has explicitly granted it.
 */
@Component
public class PublicWebsiteAccessPolicy implements AccessPolicy {

    @Override
    public Set<String> authorizedKnowledgeSpaces(AssistantProfile profile, Channel channel) {
        if (AssistantProfile.AROORAA_WEBSITE.equals(profile) && Channel.PUBLIC_WEB.equals(channel)) {
            return Set.of(KnowledgeSpace.AROORAA_PUBLIC);
        }
        return Set.of();
    }
}
