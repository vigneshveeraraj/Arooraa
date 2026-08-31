package com.arooraa.leads.contact.service;

import com.arooraa.leads.contact.domain.ContactMessage;
import com.arooraa.leads.contact.exception.ContactIdempotencyConflictException;
import com.arooraa.leads.contact.notification.service.ContactNotificationService;
import com.arooraa.leads.contact.repository.ContactMessageRepository;
import com.arooraa.leads.contact.web.dto.ContactMessageCreateRequest;
import com.arooraa.leads.contact.web.dto.ContactMessageResponse;
import com.arooraa.leads.exception.RateLimitExceededException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Orchestrates one Contact submission (W3.4 §9-13). No file upload here (unlike
 * {@code JobApplicationService}), so — like {@code ProjectEnquiryService} — the whole submit
 * path can be one {@code @Transactional} method: there's no non-transactional storage step to
 * separate out.
 */
@Service
public class ContactMessageService {

    private static final Logger log = LoggerFactory.getLogger(ContactMessageService.class);

    private final ContactMessageRepository repository;
    private final ContactReferenceGenerator referenceGenerator;
    private final ContactMessageRateLimiter rateLimiter;
    private final ContactNotificationService notificationService;

    public ContactMessageService(ContactMessageRepository repository, ContactReferenceGenerator referenceGenerator,
                                  ContactMessageRateLimiter rateLimiter, ContactNotificationService notificationService) {
        this.repository = repository;
        this.referenceGenerator = referenceGenerator;
        this.rateLimiter = rateLimiter;
        this.notificationService = notificationService;
    }

    @Transactional
    public ContactMessageSubmitOutcome submit(ContactMessageCreateRequest request, String ipHash, String idempotencyKey) {
        if (!rateLimiter.tryAcquire(ipHash)) {
            log.warn("contact-message rejected reason=RATE_LIMITED ipHashPrefix={}", prefix(ipHash));
            throw new RateLimitExceededException();
        }

        String trimmedKey = idempotencyKey == null ? null : idempotencyKey.trim();
        String normalizedKey = (trimmedKey == null || trimmedKey.isEmpty() || trimmedKey.length() > 100) ? null : trimmedKey;

        if (normalizedKey != null) {
            String fingerprint = RequestFingerprint.of(request);
            Optional<ContactMessage> existing = repository.findByIdempotencyKey(normalizedKey);
            if (existing.isPresent()) {
                return replay(existing.get(), fingerprint);
            }
            return create(request, ipHash, normalizedKey, fingerprint);
        }

        return create(request, ipHash, null, null);
    }

    private ContactMessageSubmitOutcome replay(ContactMessage existing, String fingerprint) {
        if (!fingerprint.equals(existing.getRequestFingerprint())) {
            log.warn("contact-message idempotency conflict reference={}", existing.getContactReference());
            throw new ContactIdempotencyConflictException();
        }
        log.info("contact-message idempotent replay reference={}", existing.getContactReference());
        return new ContactMessageSubmitOutcome.DuplicateDetected(new ContactMessageResponse(
                existing.getContactReference(), ContactMessageResponse.STATUS_RECEIVED, existing.getReason().name(),
                ContactMessageResponse.ALREADY_RECEIVED_MESSAGE));
    }

    private ContactMessageSubmitOutcome create(ContactMessageCreateRequest request, String ipHash,
                                                String idempotencyKey, String fingerprint) {
        String reference = referenceGenerator.next();

        ContactMessage entity = new ContactMessage(reference, request.name(), request.email(),
                blankToNull(request.phone()), blankToNull(request.company()), request.reason(), request.product(),
                request.message(), ipHash);
        if (idempotencyKey != null) {
            entity.applyIdempotency(idempotencyKey, fingerprint);
        }

        ContactMessage saved = repository.save(entity);
        // Same transaction as the insert above — commits or rolls back together.
        notificationService.createIntents(saved);
        log.info("contact-message accepted reference={} reason={}", saved.getContactReference(), saved.getReason());

        return new ContactMessageSubmitOutcome.Created(new ContactMessageResponse(
                saved.getContactReference(), ContactMessageResponse.STATUS_RECEIVED, saved.getReason().name(),
                ContactMessageResponse.DEFAULT_MESSAGE));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String prefix(String hash) {
        return hash.length() > 8 ? hash.substring(0, 8) : hash;
    }
}
