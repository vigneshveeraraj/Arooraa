package com.arooraa.leads.capture.service;

import com.arooraa.leads.capture.domain.LeadCapture;
import com.arooraa.leads.capture.domain.LeadLanguage;
import com.arooraa.leads.capture.exception.LeadCaptureIdempotencyConflictException;
import com.arooraa.leads.capture.repository.LeadCaptureRepository;
import com.arooraa.leads.capture.web.dto.LeadCaptureCreateRequest;
import com.arooraa.leads.capture.web.dto.LeadCaptureResponse;
import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.service.PhoneNumberNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * One consultation-form submission: rate limit, idempotent replay, then a single insert. Same
 * shape as ContactMessageService. The phone number is never logged — only the reference.
 */
@Service
public class LeadCaptureService {

    private static final Logger log = LoggerFactory.getLogger(LeadCaptureService.class);

    private final LeadCaptureRepository repository;
    private final LeadReferenceGenerator referenceGenerator;
    private final LeadCaptureRateLimiter rateLimiter;

    public LeadCaptureService(LeadCaptureRepository repository, LeadReferenceGenerator referenceGenerator,
                              LeadCaptureRateLimiter rateLimiter) {
        this.repository = repository;
        this.referenceGenerator = referenceGenerator;
        this.rateLimiter = rateLimiter;
    }

    @Transactional
    public LeadCaptureSubmitOutcome submit(LeadCaptureCreateRequest request, String ipHash, String idempotencyKey) {
        if (!rateLimiter.tryAcquire(ipHash)) {
            log.warn("lead-capture rejected reason=RATE_LIMITED ipHashPrefix={}", prefix(ipHash));
            throw new RateLimitExceededException();
        }

        String normalizedKey = normalizeKey(idempotencyKey);
        if (normalizedKey != null) {
            String fingerprint = RequestFingerprint.of(request);
            Optional<LeadCapture> existing = repository.findByIdempotencyKey(normalizedKey);
            if (existing.isPresent()) {
                return replay(existing.get(), fingerprint);
            }
            return create(request, ipHash, normalizedKey, fingerprint);
        }

        return create(request, ipHash, null, null);
    }

    /**
     * The same Idempotency-Key arrived twice at once and the other request's insert won the unique
     * index. Runs in a fresh transaction (the losing one is already rolled back), so the caller
     * still gets the winner's reference, or 409 if the bodies differ. Empty if the key isn't the
     * cause of the conflict.
     */
    @Transactional(readOnly = true)
    public Optional<LeadCaptureSubmitOutcome> replayAfterConcurrentInsert(LeadCaptureCreateRequest request,
                                                                          String idempotencyKey) {
        String normalizedKey = normalizeKey(idempotencyKey);
        if (normalizedKey == null) {
            return Optional.empty();
        }
        return repository.findByIdempotencyKey(normalizedKey)
                .map(existing -> replay(existing, RequestFingerprint.of(request)));
    }

    private static String normalizeKey(String idempotencyKey) {
        String trimmed = idempotencyKey == null ? null : idempotencyKey.trim();
        return (trimmed == null || trimmed.isEmpty() || trimmed.length() > 100) ? null : trimmed;
    }

    private LeadCaptureSubmitOutcome replay(LeadCapture existing, String fingerprint) {
        if (!fingerprint.equals(existing.getRequestFingerprint())) {
            log.warn("lead-capture idempotency conflict reference={}", existing.getLeadReference());
            throw new LeadCaptureIdempotencyConflictException();
        }
        log.info("lead-capture idempotent replay reference={}", existing.getLeadReference());
        return new LeadCaptureSubmitOutcome.DuplicateDetected(new LeadCaptureResponse(existing.getLeadReference()));
    }

    private LeadCaptureSubmitOutcome create(LeadCaptureCreateRequest request, String ipHash,
                                            String idempotencyKey, String fingerprint) {
        LeadCapture entity = LeadCapture.fromWebForm(
                referenceGenerator.next(),
                request.requirement(),
                PhoneNumberNormalizer.normalize(request.phone()),
                request.consentText(),
                LeadLanguage.fromCode(request.sourceLocale()),
                new LeadCapture.Attribution(request.sourcePage(), request.referrer(), request.utmSource(),
                        request.utmMedium(), request.utmCampaign(), request.utmContent()),
                ipHash);
        if (idempotencyKey != null) {
            entity.applyIdempotency(idempotencyKey, fingerprint);
        }

        LeadCapture saved = repository.saveAndFlush(entity);
        log.info("lead-capture accepted reference={} requirement={} sourceLocale={}",
                saved.getLeadReference(), saved.getRequirement(), request.sourceLocale());
        return new LeadCaptureSubmitOutcome.Created(new LeadCaptureResponse(saved.getLeadReference()));
    }

    private static String prefix(String hash) {
        return hash.length() > 8 ? hash.substring(0, 8) : hash;
    }
}
