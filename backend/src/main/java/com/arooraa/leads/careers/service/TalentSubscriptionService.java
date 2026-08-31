package com.arooraa.leads.careers.service;

import com.arooraa.leads.careers.domain.AreaOfInterest;
import com.arooraa.leads.careers.domain.TalentSubscription;
import com.arooraa.leads.careers.repository.TalentSubscriptionRepository;
import com.arooraa.leads.careers.web.dto.TalentSubscriptionCreateRequest;
import com.arooraa.leads.careers.web.dto.TalentSubscriptionResponse;
import com.arooraa.leads.exception.RateLimitExceededException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/**
 * One active subscription per email (W3.3B §12) — a second submission from the same address
 * updates the existing row (see {@link TalentSubscription#refresh}) rather than creating a
 * duplicate; the unique constraint on {@code email} is the actual guarantee, this lookup-then-
 * update-or-insert is just the normal path to it. Distinct from {@link JobApplicationService}
 * entirely: no shared table, no shared consent (W3.3B §13).
 */
@Service
public class TalentSubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(TalentSubscriptionService.class);

    private final TalentSubscriptionRepository repository;
    private final TalentSubscriptionRateLimiter rateLimiter;

    public TalentSubscriptionService(TalentSubscriptionRepository repository, TalentSubscriptionRateLimiter rateLimiter) {
        this.repository = repository;
        this.rateLimiter = rateLimiter;
    }

    @Transactional
    public TalentSubscriptionResponse subscribe(TalentSubscriptionCreateRequest request, String ipHash) {
        if (!rateLimiter.tryAcquire(ipHash)) {
            log.warn("talent-subscription rejected reason=RATE_LIMITED ipHashPrefix={}", prefix(ipHash));
            throw new RateLimitExceededException();
        }

        String normalizedEmail = request.email().toLowerCase(Locale.ROOT);
        Set<AreaOfInterest> areas = new LinkedHashSet<>(request.areasOfInterest());
        Optional<TalentSubscription> existing = repository.findByEmail(normalizedEmail);

        if (existing.isPresent()) {
            existing.get().refresh(request.name(), areas, request.experienceLevel(), request.consentAccepted());
            repository.save(existing.get());
            log.info("talent-subscription updated");
        } else {
            TalentSubscription subscription = new TalentSubscription(
                    normalizedEmail, request.name(), areas, request.experienceLevel(), request.consentAccepted());
            repository.save(subscription);
            log.info("talent-subscription created");
        }

        return new TalentSubscriptionResponse(TalentSubscriptionResponse.STATUS_SUBSCRIBED, TalentSubscriptionResponse.DEFAULT_MESSAGE);
    }

    private static String prefix(String hash) {
        return hash.length() > 8 ? hash.substring(0, 8) : hash;
    }
}
