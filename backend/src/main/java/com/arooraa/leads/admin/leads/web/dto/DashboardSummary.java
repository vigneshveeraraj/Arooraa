package com.arooraa.leads.admin.leads.web.dto;

/**
 * totalNewLeads and every pipeline/follow-up count include lead captures. newLeadCaptures is
 * appended last so existing clients that only read the original fields keep working.
 */
public record DashboardSummary(
        long totalNewLeads,
        long newProjectEnquiries,
        long newMesaDemoRequests,
        long followUpsDueToday,
        long overdueFollowUps,
        long qualified,
        long proposalSent,
        long negotiation,
        long won,
        long lost,
        long newLeadCaptures
) {
}
