package com.arooraa.leads.capture.service;

import com.arooraa.leads.service.InMemoryRateLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Own state/config — lead-capture traffic never counts against, or is limited by, any other public endpoint. */
@Component
public class LeadCaptureRateLimiter {

    private final InMemoryRateLimiter delegate;

    public LeadCaptureRateLimiter(
            @Value("${arooraa.lead-capture.rate-limit.max-requests:5}") int maxRequests,
            @Value("${arooraa.lead-capture.rate-limit.window-minutes:10}") long windowMinutes) {
        this.delegate = new InMemoryRateLimiter(maxRequests, windowMinutes);
    }

    public boolean tryAcquire(String key) {
        return delegate.tryAcquire(key);
    }
}
