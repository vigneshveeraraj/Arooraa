package com.arooraa.leads.careers.web.dto;

import com.arooraa.leads.careers.domain.AreaOfInterest;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * JSON body (no file part, unlike the application endpoint) — plain {@code @Valid @RequestBody}
 * validation, same style as {@code ProjectEnquiryCreateRequest}. {@code consentAccepted} is
 * validated with {@link AssertTrue} so an absent or false value is rejected the same way a
 * missing required field is (W3.3B §12 — "Validate consent. Do not pre-check consent
 * frontend-side" means the backend, not just the UI, must actually enforce it).
 */
public record TalentSubscriptionCreateRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @NotEmpty List<AreaOfInterest> areasOfInterest,
        @Size(max = 40) String experienceLevel,
        @AssertTrue(message = "Consent is required.") boolean consentAccepted
) {
    @JsonCreator
    public TalentSubscriptionCreateRequest(
            @JsonProperty("name") String name,
            @JsonProperty("email") String email,
            @JsonProperty("areasOfInterest") List<AreaOfInterest> areasOfInterest,
            @JsonProperty("experienceLevel") String experienceLevel,
            @JsonProperty("consentAccepted") boolean consentAccepted) {
        this.name = trim(name);
        this.email = trim(email);
        this.areasOfInterest = areasOfInterest == null ? List.of() : List.copyOf(areasOfInterest);
        this.experienceLevel = trim(experienceLevel);
        this.consentAccepted = consentAccepted;
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
