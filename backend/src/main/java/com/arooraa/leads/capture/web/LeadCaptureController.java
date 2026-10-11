package com.arooraa.leads.capture.web;

import com.arooraa.leads.capture.service.LeadCaptureService;
import com.arooraa.leads.capture.service.LeadCaptureSubmitOutcome;
import com.arooraa.leads.capture.web.dto.LeadCaptureCreateRequest;
import com.arooraa.leads.capture.web.dto.LeadCaptureResponse;
import com.arooraa.leads.service.ClientIpResolver;
import com.arooraa.leads.service.IpHasher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public, anonymous endpoint for the consultation form (frontend-v2/docs/lead-capture.md).
 * 201 only once the row is committed; the frontend shows success for nothing else.
 * The arooraa.lead-capture.enabled switch is enforced by {@link LeadCaptureFeatureGate}, before
 * the body is even read.
 */
@RestController
@RequestMapping("/api/v1/lead-captures")
public class LeadCaptureController {

    private final LeadCaptureService service;
    private final ClientIpResolver clientIpResolver;
    private final IpHasher ipHasher;

    public LeadCaptureController(LeadCaptureService service, ClientIpResolver clientIpResolver, IpHasher ipHasher) {
        this.service = service;
        this.clientIpResolver = clientIpResolver;
        this.ipHasher = ipHasher;
    }

    @PostMapping
    public ResponseEntity<LeadCaptureResponse> submit(@Valid @RequestBody LeadCaptureCreateRequest request,
                                                      @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                                      HttpServletRequest httpRequest) {
        String ipHash = ipHasher.hash(clientIpResolver.resolve(httpRequest));
        LeadCaptureSubmitOutcome outcome;
        try {
            outcome = service.submit(request, ipHash, idempotencyKey);
        } catch (DataIntegrityViolationException raceLost) {
            outcome = service.replayAfterConcurrentInsert(request, idempotencyKey).orElseThrow(() -> raceLost);
        }
        return switch (outcome) {
            case LeadCaptureSubmitOutcome.Created created -> ResponseEntity.status(HttpStatus.CREATED).body(created.body());
            case LeadCaptureSubmitOutcome.DuplicateDetected duplicate -> ResponseEntity.ok(duplicate.body());
        };
    }
}
