package com.arooraa.leads.admin.leads.web.dto;

import com.arooraa.leads.admin.leads.domain.LeadType;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record AdminLeadDetail(
        UUID id,
        LeadType leadType,
        String referenceNumber,
        String status,
        long leadVersion,
        Instant createdAt,
        String customerName,
        String companyOrRestaurant,
        String email,
        String phone,
        String cityOrCountry,
        /** Ordered label -> value, per-lead-type fields only; blank/absent values are omitted. */
        Map<String, String> submittedFields,
        ManagementInfo managementInfo,
        List<NoteResponse> notes,
        List<ActivityResponse> activity
) {
}
