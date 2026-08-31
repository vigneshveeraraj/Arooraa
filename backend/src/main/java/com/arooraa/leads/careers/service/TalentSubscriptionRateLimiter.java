package com.arooraa.leads.careers.service;

import com.arooraa.leads.service.InMemoryRateLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Own state/config, independent of every other public endpoint's rate limiter. */
@Component
public class TalentSubscriptionRateLimiter {

    private final InMemoryRateLimiter delegate;

    public TalentSubscriptionRateLimiter(
            @Value("${arooraa.recruitment.talent-community.rate-limit.max-requests:5}") int maxRequests,
            @Value("${arooraa.recruitment.talent-community.rate-limit.window-minutes:10}") long windowMinutes) {
        this.delegate = new InMemoryRateLimiter(maxRequests, windowMinutes);
    }

    public boolean tryAcquire(String key) {
        return delegate.tryAcquire(key);
    }
}
