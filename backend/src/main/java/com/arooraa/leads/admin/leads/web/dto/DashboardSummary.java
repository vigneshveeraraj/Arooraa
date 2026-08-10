package com.arooraa.leads.admin.leads.web.dto;

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
        long lost
) {
}
