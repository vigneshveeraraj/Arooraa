package com.arooraa.leads.web;

import com.arooraa.leads.service.ClientIpResolver;
import com.arooraa.leads.service.DemoRequestService;
import com.arooraa.leads.service.IpHasher;
import com.arooraa.leads.service.SubmitOutcome;
import com.arooraa.leads.web.dto.DemoRequestCreateRequest;
import com.arooraa.leads.web.dto.DemoRequestResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/demo-requests")
public class DemoRequestController {

    private static final int MAX_USER_AGENT_LENGTH = 500;

    private final DemoRequestService service;
    private final ClientIpResolver clientIpResolver;
    private final IpHasher ipHasher;

    public DemoRequestController(DemoRequestService service, ClientIpResolver clientIpResolver, IpHasher ipHasher) {
        this.service = service;
        this.clientIpResolver = clientIpResolver;
        this.ipHasher = ipHasher;
    }

    @PostMapping
    public ResponseEntity<DemoRequestResponse> submit(@Valid @RequestBody DemoRequestCreateRequest request,
                                                       HttpServletRequest httpRequest) {
        String clientIp = clientIpResolver.resolve(httpRequest);
        String ipHash = ipHasher.hash(clientIp);
        String userAgent = truncate(httpRequest.getHeader("User-Agent"), MAX_USER_AGENT_LENGTH);

        SubmitOutcome outcome = service.submit(request, ipHash, userAgent);
        return switch (outcome) {
            case SubmitOutcome.Created created -> ResponseEntity.status(HttpStatus.CREATED).body(created.body());
            case SubmitOutcome.DuplicateDetected duplicate -> ResponseEntity.ok(duplicate.body());
        };
    }

    private static String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }
}
