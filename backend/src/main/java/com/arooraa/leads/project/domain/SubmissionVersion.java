package com.arooraa.leads.project.domain;

/**
 * Discriminates the two shapes {@link ProjectEnquiry} rows can now take (W3.2B). LEGACY rows
 * come from the original flat form contract (serviceType/projectType/description/budgetRange/
 * timeline all populated, guided-only columns null). GUIDED rows come from the frontend-v2
 * guided Start Project flow (solutionModel/engagementModel/problemStatement/projectStage/
 * guidedTimeline populated, legacy-only columns null). Deliberately not merged into one enum
 * value set — the two eras' fields are not a deterministic 1:1 mapping.
 */
public enum SubmissionVersion {
    LEGACY,
    GUIDED
}
