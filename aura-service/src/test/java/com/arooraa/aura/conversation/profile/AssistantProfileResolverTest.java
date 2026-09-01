package com.arooraa.aura.conversation.profile;

import com.arooraa.aura.retrieval.context.AssistantProfile;
import com.arooraa.aura.retrieval.context.Channel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AssistantProfileResolverTest {

    private final AssistantProfileResolver resolver = new AssistantProfileResolver();

    @Test
    void theWebsiteProfileResolvesToItsOwnChannelAndOrganisation() {
        AssistantProfileDefinition profile = resolver.resolve("AROORAA_WEBSITE").orElseThrow();

        assertEquals(AssistantProfile.AROORAA_WEBSITE, profile.profile());
        assertEquals(Channel.PUBLIC_WEB, profile.channel());
        assertEquals("AROORAA", profile.organisation());
    }

    @Test
    void anUnknownProfileResolvesToNothingRatherThanTheDefault() {
        // Failing closed matters here: silently falling back would turn a typo — or a probe — into
        // a grant of the website assistant's (broadest) capabilities.
        assertTrue(resolver.resolve("MESA_TENANT_42").isEmpty());
        assertTrue(resolver.resolve("").isEmpty());
    }

    @Test
    void theWebsiteProfileIsTheDefaultForAConversationOpenedWithoutOne() {
        assertEquals(AssistantProfile.AROORAA_WEBSITE, resolver.defaultProfile().profile());
    }

    @Test
    void capabilitiesAreCheckableSoAFutureProfileCanBeGenuinelyNarrower() {
        AssistantProfileDefinition website = resolver.defaultProfile();
        assertTrue(website.allows(AssistantCapability.GROUNDED_ANSWERS));
        assertTrue(website.allows(AssistantCapability.PROJECT_DISCOVERY));

        AssistantProfileDefinition narrow = new AssistantProfileDefinition(
                new AssistantProfile("FUTURE_NARROW"), Channel.PUBLIC_WEB, "AROORAA", "narrower surface",
                java.util.EnumSet.of(AssistantCapability.GROUNDED_ANSWERS));
        assertTrue(narrow.allows(AssistantCapability.GROUNDED_ANSWERS));
        assertFalse(narrow.allows(AssistantCapability.PROJECT_DISCOVERY));
    }
}
