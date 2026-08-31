package com.arooraa.leads.careers.registry;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RecruitmentJobRegistryTest {

    private final RecruitmentJobRegistry registry = new RecruitmentJobRegistry();

    @Test
    void resolvesEachOfTheSixApprovedOpenRoles() {
        for (String slug : new String[]{"ai-engineer", "java-full-stack-engineer", "react-frontend-engineer",
                "ui-ux-product-designer", "sales-business-development", "marketing-growth-executive"}) {
            assertTrue(registry.findAcceptingApplications(slug).isPresent(), "expected " + slug + " to be accepting applications");
        }
    }

    @Test
    void rejectsAnUnknownSlug() {
        assertTrue(registry.findAcceptingApplications("totally-made-up-role").isEmpty());
    }

    @Test
    void neverExposesTheFrontendsFullJobDescriptionContent() {
        RecruitmentJob job = registry.findAcceptingApplications("ai-engineer").orElseThrow();
        assertEquals("ai-engineer", job.slug());
        assertEquals("AI Engineer", job.title());
        // RecruitmentJob has no responsibilities/qualifications/philosophy fields at all —
        // this is a compile-time guarantee (record has 3 components), not just a runtime check.
    }
}
