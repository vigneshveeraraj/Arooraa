package com.arooraa.leads.careers.web;

import com.arooraa.leads.careers.service.JobApplicationService;
import com.arooraa.leads.careers.service.JobApplicationSubmitOutcome;
import com.arooraa.leads.careers.web.dto.JobApplicationCreateRequest;
import com.arooraa.leads.careers.web.dto.JobApplicationResponse;
import com.arooraa.leads.service.ClientIpResolver;
import com.arooraa.leads.service.IpHasher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Public, anonymous endpoint (W3.3B §5) — multipart/form-data because a résumé upload is
 * required support, though the résumé field itself stays optional, matching the already-
 * approved W3.3A frontend contract. Every field is read as a plain {@code @RequestParam} rather
 * than bound onto a validated record, since {@code @Valid} on a multipart-bound
 * {@code @ModelAttribute} record has framework-version-dependent behavior this codebase doesn't
 * otherwise rely on; validation instead happens explicitly in
 * {@code JobApplicationRequestValidator}, called from the service.
 */
@RestController
@RequestMapping("/api/v1/careers/applications")
public class JobApplicationController {

    private final JobApplicationService service;
    private final ClientIpResolver clientIpResolver;
    private final IpHasher ipHasher;

    public JobApplicationController(JobApplicationService service, ClientIpResolver clientIpResolver, IpHasher ipHasher) {
        this.service = service;
        this.clientIpResolver = clientIpResolver;
        this.ipHasher = ipHasher;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JobApplicationResponse> submit(
            @RequestParam("jobSlug") String jobSlug,
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam(value = "currentLocation", required = false) String currentLocation,
            @RequestParam(value = "experience", required = false) String experience,
            @RequestParam(value = "linkedinUrl", required = false) String linkedinUrl,
            @RequestParam(value = "portfolioUrl", required = false) String portfolioUrl,
            @RequestParam(value = "note", required = false) String note,
            @RequestParam(value = "recruitmentConsent", defaultValue = "false") boolean recruitmentConsent,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            HttpServletRequest httpRequest) {

        String clientIp = clientIpResolver.resolve(httpRequest);
        String ipHash = ipHasher.hash(clientIp);
        boolean resumeAttached = resume != null && !resume.isEmpty();

        JobApplicationCreateRequest request = new JobApplicationCreateRequest(
                trim(jobSlug), trim(fullName), trim(email), trim(phone),
                trim(currentLocation), trim(experience), trim(linkedinUrl), trim(portfolioUrl), trim(note),
                recruitmentConsent,
                resumeAttached ? resume.getOriginalFilename() : null,
                resumeAttached ? resume.getContentType() : null,
                resumeAttached ? resume.getSize() : null);

        JobApplicationSubmitOutcome outcome = service.submit(request, resumeAttached ? resume : null, ipHash, idempotencyKey);
        return switch (outcome) {
            case JobApplicationSubmitOutcome.Created created -> ResponseEntity.status(HttpStatus.CREATED).body(created.body());
            case JobApplicationSubmitOutcome.DuplicateDetected duplicate -> ResponseEntity.ok(duplicate.body());
        };
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
