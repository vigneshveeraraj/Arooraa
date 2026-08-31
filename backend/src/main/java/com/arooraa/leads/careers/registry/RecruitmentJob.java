package com.arooraa.leads.careers.registry;

/**
 * Recruitment-relevant identity for one role — deliberately NOT a copy of the frontend's full
 * job-description content (responsibilities, qualifications, philosophy, ...). frontend-v2's
 * {@code lib/careers/jobs.ts} remains the single source of truth for what a role IS and reads
 * like; the backend only needs to know enough to validate and label an application (W3.3B §4).
 */
public record RecruitmentJob(String slug, String title, boolean acceptingApplications) {
}
