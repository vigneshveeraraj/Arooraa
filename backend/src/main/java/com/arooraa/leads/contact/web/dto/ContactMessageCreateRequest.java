package com.arooraa.leads.contact.web.dto;

import com.arooraa.leads.contact.domain.ContactProduct;
import com.arooraa.leads.contact.domain.ContactReason;
import com.arooraa.leads.validation.MustBeBlank;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Kept intentionally small (W3.4 §4) — no budget/timeline/project-stage/engagement-model
 * fields. {@code product} is always optional at this layer regardless of {@code reason}; the
 * frontend decides when it's worth asking for (W3.4 §8).
 */
public record ContactMessageCreateRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @Size(max = 30) String phone,
        @Size(max = 150) String company,
        @NotNull ContactReason reason,
        ContactProduct product,
        @NotBlank @Size(min = 10, max = 2000) String message,

        @MustBeBlank String website
) {
    @JsonCreator
    public ContactMessageCreateRequest(
            @JsonProperty("name") String name,
            @JsonProperty("email") String email,
            @JsonProperty("phone") String phone,
            @JsonProperty("company") String company,
            @JsonProperty("reason") ContactReason reason,
            @JsonProperty("product") ContactProduct product,
            @JsonProperty("message") String message,
            @JsonProperty("website") String website) {
        this.name = trim(name);
        this.email = trim(email);
        this.phone = trim(phone);
        this.company = trim(company);
        this.reason = reason;
        this.product = product;
        this.message = trim(message);
        this.website = website;
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
