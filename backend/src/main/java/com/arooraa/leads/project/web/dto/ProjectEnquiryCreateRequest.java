package com.arooraa.leads.project.web.dto;

import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.Timeline;
import com.arooraa.leads.project.validation.ValidInternationalPhone;
import com.arooraa.leads.validation.MustBeBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProjectEnquiryCreateRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 150) String companyName,
        @NotBlank @Email @Size(max = 254) String businessEmail,
        @NotBlank @ValidInternationalPhone String phone,
        @NotBlank @Size(max = 100) String country,
        @NotNull ServiceType serviceType,
        @NotNull ProjectType projectType,
        @NotBlank @Size(min = 20, max = 3000) String description,
        @NotNull Boolean existingSystem,
        @NotNull BudgetRange budgetRange,
        @NotNull Timeline timeline,
        @NotNull PreferredContactMethod preferredContactMethod,

        @Size(max = 50) String source,
        @Size(max = 500) String sourcePage,
        @Size(max = 1000) String referrer,
        @Size(max = 200) String utmSource,
        @Size(max = 200) String utmMedium,
        @Size(max = 200) String utmCampaign,
        @MustBeBlank String website
) {
    public ProjectEnquiryCreateRequest {
        name = trim(name);
        companyName = trim(companyName);
        businessEmail = trim(businessEmail);
        phone = trim(phone);
        country = trim(country);
        description = trim(description);
        source = trim(source);
        sourcePage = trim(sourcePage);
        referrer = trim(referrer);
        utmSource = trim(utmSource);
        utmMedium = trim(utmMedium);
        utmCampaign = trim(utmCampaign);
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
