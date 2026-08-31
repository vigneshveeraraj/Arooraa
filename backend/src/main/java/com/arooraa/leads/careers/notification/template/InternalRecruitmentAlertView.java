package com.arooraa.leads.careers.notification.template;

/** Internal-only view — never sent to the candidate. Still excludes IP/user-agent (W3.3B §13). */
public record InternalRecruitmentAlertView(
        String reference,
        String receivedAt,
        String jobTitle,
        String candidateName,
        String email,
        String phone,
        String currentLocation,
        String experience,
        String linkedinUrl,
        String portfolioUrl,
        String note,
        boolean resumeAttached
) {
}
