package com.arooraa.leads.careers.web;

import com.arooraa.leads.careers.service.TalentSubscriptionService;
import com.arooraa.leads.careers.web.dto.TalentSubscriptionCreateRequest;
import com.arooraa.leads.careers.web.dto.TalentSubscriptionResponse;
import com.arooraa.leads.service.ClientIpResolver;
import com.arooraa.leads.service.IpHasher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public, anonymous endpoint (W3.3B §12) — plain JSON, no file part. */
@RestController
@RequestMapping("/api/v1/careers/talent-community")
public class TalentSubscriptionController {

    private final TalentSubscriptionService service;
    private final ClientIpResolver clientIpResolver;
    private final IpHasher ipHasher;

    public TalentSubscriptionController(TalentSubscriptionService service, ClientIpResolver clientIpResolver, IpHasher ipHasher) {
        this.service = service;
        this.clientIpResolver = clientIpResolver;
        this.ipHasher = ipHasher;
    }

    @PostMapping
    public ResponseEntity<TalentSubscriptionResponse> subscribe(@Valid @RequestBody TalentSubscriptionCreateRequest request,
                                                                   HttpServletRequest httpRequest) {
        String ipHash = ipHasher.hash(clientIpResolver.resolve(httpRequest));
        TalentSubscriptionResponse response = service.subscribe(request, ipHash);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
