package com.arooraa.leads.careers.web.dto;

/**
 * The plain-text half of a job application submission — built by
 * {@code JobApplicationController} from multipart form fields (not JSON, and not
 * {@code @Valid @RequestBody}, since the request also carries a file part; see
 * {@code JobApplicationRequestValidator} for how this gets validated). The résumé file itself
 * travels alongside this record as a separate {@code MultipartFile}, not as a field here — this
 * record only needs enough about the résumé (filename/content type/size, already read off the
 * {@code MultipartFile} before validation) to compute an idempotency fingerprint.
 */
public record JobApplicationCreateRequest(
        String jobSlug,
        String fullName,
        String email,
        String phone,
        String currentLocation,
        String experience,
        String linkedinUrl,
        String portfolioUrl,
        String note,
        boolean recruitmentConsent,
        String resumeOriginalFilename,
        String resumeContentType,
        Long resumeSize
) {
}
