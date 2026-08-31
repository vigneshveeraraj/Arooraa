package com.arooraa.leads.contact.web;

import com.arooraa.leads.contact.service.ContactMessageService;
import com.arooraa.leads.contact.service.ContactMessageSubmitOutcome;
import com.arooraa.leads.contact.web.dto.ContactMessageCreateRequest;
import com.arooraa.leads.contact.web.dto.ContactMessageResponse;
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

/** Public, anonymous endpoint (W3.4 §11) — plain JSON, same shape as project-enquiries/demo-requests. */
@RestController
@RequestMapping("/api/v1/contact/messages")
public class ContactMessageController {

    private final ContactMessageService service;
    private final ClientIpResolver clientIpResolver;
    private final IpHasher ipHasher;

    public ContactMessageController(ContactMessageService service, ClientIpResolver clientIpResolver, IpHasher ipHasher) {
        this.service = service;
        this.clientIpResolver = clientIpResolver;
        this.ipHasher = ipHasher;
    }

    @PostMapping
    public ResponseEntity<ContactMessageResponse> submit(@Valid @RequestBody ContactMessageCreateRequest request,
                                                            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                                            HttpServletRequest httpRequest) {
        String ipHash = ipHasher.hash(clientIpResolver.resolve(httpRequest));
        ContactMessageSubmitOutcome outcome = service.submit(request, ipHash, idempotencyKey);
        return switch (outcome) {
            case ContactMessageSubmitOutcome.Created created -> ResponseEntity.status(HttpStatus.CREATED).body(created.body());
            case ContactMessageSubmitOutcome.DuplicateDetected duplicate -> ResponseEntity.ok(duplicate.body());
        };
    }
}
