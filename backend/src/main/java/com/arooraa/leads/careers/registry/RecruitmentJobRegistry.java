package com.arooraa.leads.careers.registry;

import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Backend-authoritative allowlist of which job slugs currently accept applications (W3.3B §4).
 *
 * <p><b>Source-of-truth split:</b> frontend-v2's {@code lib/careers/jobs.ts} remains the single
 * source of truth for a role's full content — title, responsibilities, qualifications,
 * "how we think about this role", etc. Duplicating all of that here would create two places
 * that must always agree, with no mechanism to keep them in sync. Instead this registry holds
 * only the minimum the backend actually needs to do its own job: is this a real slug, and is it
 * currently open. The frontend already independently enforces "no Apply CTA for a non-OPEN
 * role" in its own UI; this registry is what stops a request that bypasses that UI entirely
 * (a raw POST with a fabricated or stale slug) from ever becoming a persisted application.
 *
 * <p>Changing which roles accept applications requires a backend code change + deploy, same as
 * changing frontend-v2's job dataset does today. A future recruitment-admin milestone may want
 * to move this to the database so it can change without a deploy — deliberately not done here,
 * to keep this milestone's scope to "validate against a known-good list," not "build a job
 * management system."
 */
@Component
public class RecruitmentJobRegistry {

    private final Map<String, RecruitmentJob> jobsBySlug;

    public RecruitmentJobRegistry() {
        Map<String, RecruitmentJob> jobs = new LinkedHashMap<>();
        register(jobs, "ai-engineer", "AI Engineer");
        register(jobs, "java-full-stack-engineer", "Java Full Stack Engineer");
        register(jobs, "react-frontend-engineer", "React Frontend Engineer");
        register(jobs, "ui-ux-product-designer", "UI/UX Product Designer");
        register(jobs, "sales-business-development", "Sales & Business Development Executive");
        register(jobs, "marketing-growth-executive", "Marketing & Growth Executive");
        this.jobsBySlug = Map.copyOf(jobs);
    }

    private static void register(Map<String, RecruitmentJob> jobs, String slug, String title) {
        jobs.put(slug, new RecruitmentJob(slug, title, true));
    }

    /** Empty when the slug is unknown, or known but not currently accepting applications (PLANNED/CLOSED). */
    public Optional<RecruitmentJob> findAcceptingApplications(String slug) {
        RecruitmentJob job = jobsBySlug.get(slug);
        if (job == null || !job.acceptingApplications()) {
            return Optional.empty();
        }
        return Optional.of(job);
    }
}
