package com.arooraa.leads.project.web.dto;

import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.EngagementModel;
import com.arooraa.leads.project.domain.GuidedBudgetRange;
import com.arooraa.leads.project.domain.GuidedTimeline;
import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.PreferredContactTime;
import com.arooraa.leads.project.domain.ProductType;
import com.arooraa.leads.project.domain.ProjectStage;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.SolutionModel;
import com.arooraa.leads.project.domain.SubmissionVersion;
import com.arooraa.leads.project.domain.Timeline;
import com.arooraa.leads.project.validation.ValidInternationalPhone;
import com.arooraa.leads.validation.MustBeBlank;
import com.arooraa.leads.project.validation.ValidProjectEnquiryRequest;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * One request contract serving both submission shapes (W3.2B). {@code submissionVersion}
 * discriminates which field group is actually required — that requiredness is conditional
 * (LEGACY needs serviceType/projectType/description/existingSystem/budgetRange/timeline;
 * GUIDED needs solutionModel/engagementModel/problemStatement/projectStage/guidedTimeline), so
 * it's enforced in {@link com.arooraa.leads.project.service.ProjectEnquiryService}, not with
 * bean-validation annotations here — annotations can't express "required only if X". Fields
 * shared by both shapes (name/businessEmail/phone/country/preferredContactMethod) keep their
 * unconditional {@code @NotBlank}/{@code @NotNull} annotations. The conditional requiredness
 * itself is enforced by {@link ValidProjectEnquiryRequest}, a class-level constraint, so a
 * missing conditionally-required field still surfaces as an ordinary 400 VALIDATION_ERROR
 * field error through the existing {@code MethodArgumentNotValidException} handling — no new
 * error shape needed.
 *
 * <p>The legacy-shaped secondary constructor below preserves the exact original 19-parameter
 * signature so every existing caller (old frontend's JSON body, by field name; any Java code
 * still using the old positional constructor) keeps working unchanged — see its Javadoc.
 */
@ValidProjectEnquiryRequest
public record ProjectEnquiryCreateRequest(
        SubmissionVersion submissionVersion,

        @NotBlank @Size(max = 100) String name,
        @Size(max = 150) String companyName,
        @NotBlank @Email @Size(max = 254) String businessEmail,
        @NotBlank @ValidInternationalPhone String phone,
        @NotBlank @Size(max = 100) String country,
        @Size(max = 4) String countryCode,
        @Size(max = 100) String role,

        // Legacy-path fields — required only when submissionVersion == LEGACY.
        ServiceType serviceType,
        ProjectType projectType,
        @Size(min = 20, max = 3000) String description,
        Boolean existingSystem,
        BudgetRange budgetRange,
        Timeline timeline,

        // Guided-path fields — required only when submissionVersion == GUIDED.
        SolutionModel solutionModel,
        EngagementModel engagementModel,
        @Size(max = 3000) String problemStatement,
        ProjectStage projectStage,
        List<ProductType> productTypes,
        GuidedTimeline guidedTimeline,
        GuidedBudgetRange guidedBudgetRange,
        @Size(max = 3000) String existingSystemContext,

        @NotNull PreferredContactMethod preferredContactMethod,
        PreferredContactTime preferredContactTime,
        Boolean whatsappConsent,

        @Size(max = 50) String source,
        @Size(max = 500) String sourcePage,
        @Size(max = 1000) String referrer,
        @Size(max = 200) String utmSource,
        @Size(max = 200) String utmMedium,
        @Size(max = 200) String utmCampaign,
        @Size(max = 200) String utmContent,
        @Size(max = 60) String sourceContext,
        @Size(max = 500) String entryRoute,

        @MustBeBlank String website
) {
    @JsonCreator
    public ProjectEnquiryCreateRequest(
            @JsonProperty("submissionVersion") SubmissionVersion submissionVersion,
            @JsonProperty("name") String name,
            @JsonProperty("companyName") String companyName,
            @JsonProperty("businessEmail") String businessEmail,
            @JsonProperty("phone") String phone,
            @JsonProperty("country") String country,
            @JsonProperty("countryCode") String countryCode,
            @JsonProperty("role") String role,
            @JsonProperty("serviceType") ServiceType serviceType,
            @JsonProperty("projectType") ProjectType projectType,
            @JsonProperty("description") String description,
            @JsonProperty("existingSystem") Boolean existingSystem,
            @JsonProperty("budgetRange") BudgetRange budgetRange,
            @JsonProperty("timeline") Timeline timeline,
            @JsonProperty("solutionModel") SolutionModel solutionModel,
            @JsonProperty("engagementModel") EngagementModel engagementModel,
            @JsonProperty("problemStatement") String problemStatement,
            @JsonProperty("projectStage") ProjectStage projectStage,
            @JsonProperty("productTypes") List<ProductType> productTypes,
            @JsonProperty("guidedTimeline") GuidedTimeline guidedTimeline,
            @JsonProperty("guidedBudgetRange") GuidedBudgetRange guidedBudgetRange,
            @JsonProperty("existingSystemContext") String existingSystemContext,
            @JsonProperty("preferredContactMethod") PreferredContactMethod preferredContactMethod,
            @JsonProperty("preferredContactTime") PreferredContactTime preferredContactTime,
            @JsonProperty("whatsappConsent") Boolean whatsappConsent,
            @JsonProperty("source") String source,
            @JsonProperty("sourcePage") String sourcePage,
            @JsonProperty("referrer") String referrer,
            @JsonProperty("utmSource") String utmSource,
            @JsonProperty("utmMedium") String utmMedium,
            @JsonProperty("utmCampaign") String utmCampaign,
            @JsonProperty("utmContent") String utmContent,
            @JsonProperty("sourceContext") String sourceContext,
            @JsonProperty("entryRoute") String entryRoute,
            @JsonProperty("website") String website) {
        this.submissionVersion = submissionVersion == null ? SubmissionVersion.LEGACY : submissionVersion;
        this.name = trim(name);
        this.companyName = trim(companyName);
        this.businessEmail = trim(businessEmail);
        this.phone = trim(phone);
        this.country = trim(country);
        this.countryCode = trim(countryCode);
        this.role = trim(role);
        this.serviceType = serviceType;
        this.projectType = projectType;
        this.description = trim(description);
        this.existingSystem = existingSystem;
        this.budgetRange = budgetRange;
        this.timeline = timeline;
        this.solutionModel = solutionModel;
        this.engagementModel = engagementModel;
        this.problemStatement = trim(problemStatement);
        this.projectStage = projectStage;
        this.productTypes = productTypes == null ? List.of() : List.copyOf(productTypes);
        this.guidedTimeline = guidedTimeline;
        this.guidedBudgetRange = guidedBudgetRange;
        this.existingSystemContext = trim(existingSystemContext);
        this.preferredContactMethod = preferredContactMethod;
        this.preferredContactTime = preferredContactTime;
        this.whatsappConsent = whatsappConsent;
        this.source = trim(source);
        this.sourcePage = trim(sourcePage);
        this.referrer = trim(referrer);
        this.utmSource = trim(utmSource);
        this.utmMedium = trim(utmMedium);
        this.utmCampaign = trim(utmCampaign);
        this.utmContent = trim(utmContent);
        this.sourceContext = trim(sourceContext);
        this.entryRoute = trim(entryRoute);
        this.website = website;
    }

    /**
     * The original pre-W3.2B contract, byte-for-byte the same parameter list and order. Every
     * caller built against the old shape — Java code and, more importantly, the live old
     * frontend's JSON body (Jackson maps by field name onto the {@code @JsonCreator}
     * constructor above, so this overload is purely for source callers) — keeps compiling and
     * behaving identically: {@code submissionVersion} defaults to LEGACY and every guided-only
     * field is absent.
     */
    public ProjectEnquiryCreateRequest(String name, String companyName, String businessEmail, String phone,
                                        String country, ServiceType serviceType, ProjectType projectType,
                                        String description, Boolean existingSystem, BudgetRange budgetRange,
                                        Timeline timeline, PreferredContactMethod preferredContactMethod,
                                        String source, String sourcePage, String referrer, String utmSource,
                                        String utmMedium, String utmCampaign, String website) {
        this(SubmissionVersion.LEGACY, name, companyName, businessEmail, phone, country, null, null,
                serviceType, projectType, description, existingSystem, budgetRange, timeline,
                null, null, null, null, List.of(), null, null, null,
                preferredContactMethod, null, null,
                source, sourcePage, referrer, utmSource, utmMedium, utmCampaign, null, null, null,
                website);
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
