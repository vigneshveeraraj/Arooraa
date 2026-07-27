package com.arooraa.leads.service;

import com.arooraa.leads.domain.DemoRequest;
import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.repository.DemoRequestRepository;
import com.arooraa.leads.web.dto.DemoRequestCreateRequest;
import com.arooraa.leads.web.dto.DemoRequestResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class DemoRequestService {

    private static final Logger log = LoggerFactory.getLogger(DemoRequestService.class);

    private final DemoRequestRepository repository;
    private final InMemoryRateLimiter rateLimiter;
    private final Duration duplicateWindow;

    public DemoRequestService(DemoRequestRepository repository,
                               InMemoryRateLimiter rateLimiter,
                               @Value("${arooraa.duplicate.window-minutes:5}") long duplicateWindowMinutes) {
        this.repository = repository;
        this.rateLimiter = rateLimiter;
        this.duplicateWindow = Duration.ofMinutes(duplicateWindowMinutes);
    }

    @Transactional
    public SubmitOutcome submit(DemoRequestCreateRequest request, String ipHash, String userAgent) {
        if (!rateLimiter.tryAcquire(ipHash)) {
            log.warn("demo-request rejected reason=RATE_LIMITED ipHashPrefix={}", prefix(ipHash));
            throw new RateLimitExceededException();
        }

        String normalizedPhone = PhoneNumberNormalizer.normalize(request.whatsappNumber());
        Instant since = Instant.now().minus(duplicateWindow);
        List<DemoRequest> duplicates = repository.findRecentDuplicates(normalizedPhone, request.restaurantName(), since);
        if (!duplicates.isEmpty()) {
            DemoRequest existing = duplicates.get(0);
            log.info("demo-request duplicate detected requestId={}", existing.getId());
            return new SubmitOutcome.DuplicateDetected(new DemoRequestResponse(
                    existing.getId(), DemoRequestResponse.STATUS_ALREADY_RECEIVED,
                    DemoRequestResponse.ALREADY_RECEIVED_MESSAGE));
        }

        DemoRequest entity = new DemoRequest(
                request.contactName(), request.restaurantName(), normalizedPhone,
                request.businessEmail(), request.city(), request.outletCount(), request.restaurantType(),
                request.primaryChallenge(), request.currentSoftware(), request.preferredDemoDate(),
                request.preferredDemoTime(), request.additionalMessage(), request.sourcePage(),
                ipHash, userAgent, request.referrer(), request.utmSource(), request.utmMedium(),
                request.utmCampaign());

        DemoRequest saved = repository.save(entity);
        log.info("demo-request accepted requestId={} restaurantType={} outletCount={} primaryChallenge={}",
                saved.getId(), saved.getRestaurantType(), saved.getOutletCount(), saved.getPrimaryChallenge());

        return new SubmitOutcome.Created(new DemoRequestResponse(
                saved.getId(), DemoRequestResponse.STATUS_RECEIVED, DemoRequestResponse.DEFAULT_MESSAGE));
    }

    private static String prefix(String hash) {
        return hash.length() > 8 ? hash.substring(0, 8) : hash;
    }
}
