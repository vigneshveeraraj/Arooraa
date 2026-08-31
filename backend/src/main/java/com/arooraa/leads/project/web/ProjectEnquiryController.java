package com.arooraa.leads.project.web;

import com.arooraa.leads.project.service.ProjectEnquiryService;
import com.arooraa.leads.project.service.ProjectEnquirySubmitOutcome;
import com.arooraa.leads.project.web.dto.ProjectEnquiryCreateRequest;
import com.arooraa.leads.project.web.dto.ProjectEnquiryResponse;
import com.arooraa.leads.service.ClientIpResolver;
import com.arooraa.leads.service.IpHasher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/project-enquiries")
public class ProjectEnquiryController {

    private static final int MAX_USER_AGENT_LENGTH = 500;

    private final ProjectEnquiryService service;
    private final ClientIpResolver clientIpResolver;
    private final IpHasher ipHasher;

    public ProjectEnquiryController(ProjectEnquiryService service, ClientIpResolver clientIpResolver,
                                     IpHasher ipHasher) {
        this.service = service;
        this.clientIpResolver = clientIpResolver;
        this.ipHasher = ipHasher;
    }

    @PostMapping
    public ResponseEntity<ProjectEnquiryResponse> submit(@Valid @RequestBody ProjectEnquiryCreateRequest request,
                                                           @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                                           HttpServletRequest httpRequest) {
        String clientIp = clientIpResolver.resolve(httpRequest);
        String ipHash = ipHasher.hash(clientIp);
        String userAgent = truncate(httpRequest.getHeader("User-Agent"), MAX_USER_AGENT_LENGTH);

        ProjectEnquirySubmitOutcome outcome = service.submit(request, ipHash, userAgent, idempotencyKey);
        return switch (outcome) {
            case ProjectEnquirySubmitOutcome.Created created ->
                    ResponseEntity.status(HttpStatus.CREATED).body(created.body());
            case ProjectEnquirySubmitOutcome.DuplicateDetected duplicate -> ResponseEntity.ok(duplicate.body());
        };
    }

    private static String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }
}
