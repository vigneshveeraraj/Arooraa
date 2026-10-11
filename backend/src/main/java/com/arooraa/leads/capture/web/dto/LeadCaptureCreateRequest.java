package com.arooraa.leads.capture.web.dto;

import com.arooraa.leads.capture.domain.LeadRequirement;
import com.arooraa.leads.validation.MustBeBlank;
import com.arooraa.leads.validation.ValidIndianMobile;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * The whole public contract (frontend-v2/docs/lead-capture.md): a requirement, an Indian mobile
 * and explicit consent. No name, email or budget is accepted, so none can be stored.
 * {@code source} is accepted only as WEBSITE — a browser can never claim a lead came from WhatsApp.
 *
 * Attribution (page, referrer, UTM) is cut to its column size rather than rejected: a long ad
 * URL must never cost a real lead.
 */
public record LeadCaptureCreateRequest(
        @NotNull LeadRequirement requirement,
        @ValidIndianMobile String phone,
        @Pattern(regexp = "IN", message = "Only Indian mobile numbers are supported.") String countryCode,
        @NotNull(message = "Consent is required.") @AssertTrue(message = "Consent is required.") Boolean consent,
        @NotBlank @Size(max = 500) String consentText,
        @NotNull @Pattern(regexp = "en|ta", message = "Unsupported language.") String sourceLocale,
        @Pattern(regexp = "WEBSITE", message = "Unsupported source.") String source,
        String sourcePage,
        String referrer,
        String utmSource,
        String utmMedium,
        String utmCampaign,
        String utmContent,

        @MustBeBlank String website
) {
    @JsonCreator
    public LeadCaptureCreateRequest(
            @JsonProperty("requirement") LeadRequirement requirement,
            @JsonProperty("phone") String phone,
            @JsonProperty("countryCode") String countryCode,
            @JsonProperty("consent") Boolean consent,
            @JsonProperty("consentText") String consentText,
            @JsonProperty("sourceLocale") String sourceLocale,
            @JsonProperty("source") String source,
            @JsonProperty("sourcePage") String sourcePage,
            @JsonProperty("referrer") String referrer,
            @JsonProperty("utmSource") String utmSource,
            @JsonProperty("utmMedium") String utmMedium,
            @JsonProperty("utmCampaign") String utmCampaign,
            @JsonProperty("utmContent") String utmContent,
            @JsonProperty("website") String website) {
        this.requirement = requirement;
        this.phone = trim(phone);
        this.countryCode = trim(countryCode);
        this.consent = consent;
        this.consentText = trim(consentText);
        this.sourceLocale = trim(sourceLocale);
        this.source = trim(source);
        this.sourcePage = attribution(sourcePage, 500);
        this.referrer = attribution(referrer, 500);
        this.utmSource = attribution(utmSource, 100);
        this.utmMedium = attribution(utmMedium, 100);
        this.utmCampaign = attribution(utmCampaign, 100);
        this.utmContent = attribution(utmContent, 100);
        this.website = website;
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }

    private static String attribution(String value, int maxLength) {
        String trimmed = trim(value);
        if (trimmed == null || trimmed.isEmpty()) {
            return null;
        }
        return trimmed.length() > maxLength ? trimmed.substring(0, maxLength) : trimmed;
    }
}
