package com.arooraa.aura.discovery.handoff;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * How to reach the visitor. Exactly the five things the Start Project workflow genuinely requires,
 * plus two it accepts and a person is often glad to give.
 *
 * <p>Nothing here is ever stored by this service. A brief holds what the project is; contact
 * details pass through this record to the workflow that legitimately holds them, and aura-service
 * keeps no copy. So a conversation database that leaked would contain project descriptions and no
 * way to attach a name to any of them.
 *
 * <p>Validated with bean-validation annotations at the edge, because these values came from a
 * form a person filled in and every one of them is theirs to get wrong. The phone is checked only
 * for shape here — the Start Project workflow does the real international validation, and
 * duplicating that rule is how two systems come to disagree about which numbers are valid.
 */
public record HandoffContact(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 150) String companyName,
        @NotBlank @Email @Size(max = 254) String businessEmail,
        @NotBlank @Size(min = 6, max = 32) @Pattern(regexp = "[0-9+()\\-.\\s]+",
                message = "A phone number should contain only digits and the usual separators.")
        String phone,
        @NotBlank @Size(max = 100) String country,
        @Size(max = 100) String role,
        @NotBlank @Pattern(regexp = "EMAIL|PHONE|WHATSAPP|VIDEO_CALL",
                message = "Choose one of the offered ways to be contacted.")
        String preferredContactMethod) {
}
