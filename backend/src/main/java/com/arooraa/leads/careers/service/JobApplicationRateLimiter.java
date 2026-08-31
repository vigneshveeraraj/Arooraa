package com.arooraa.leads.careers.service;

import com.arooraa.leads.service.InMemoryRateLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Own InMemoryRateLimiter instance (own state, own config keys) — applying to a role must
 * never count against, or be limited by, Start a Project or MESA demo-request traffic, and
 * vice versa (mirrors ProjectEnquiryRateLimiter's exact reasoning).
 */
@Component
public class JobApplicationRateLimiter {

    private final InMemoryRateLimiter delegate;

    public JobApplicationRateLimiter(
            @Value("${arooraa.recruitment.rate-limit.max-requests:5}") int maxRequests,
            @Value("${arooraa.recruitment.rate-limit.window-minutes:10}") long windowMinutes) {
        this.delegate = new InMemoryRateLimiter(maxRequests, windowMinutes);
    }

    public boolean tryAcquire(String key) {
        return delegate.tryAcquire(key);
    }
}
