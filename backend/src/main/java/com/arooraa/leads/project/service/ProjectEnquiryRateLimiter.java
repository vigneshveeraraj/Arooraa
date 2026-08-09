package com.arooraa.leads.project.service;

import com.arooraa.leads.service.InMemoryRateLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Wraps a private InMemoryRateLimiter instance (own state, own config keys) rather than
 * sharing the singleton InMemoryRateLimiter bean used by MESA demo requests. Submitting
 * project enquiries must never count against, or be limited by, demo-request traffic
 * and vice versa.
 */
@Component
public class ProjectEnquiryRateLimiter {

    private final InMemoryRateLimiter delegate;

    public ProjectEnquiryRateLimiter(
            @Value("${arooraa.project-enquiry.rate-limit.max-requests:5}") int maxRequests,
            @Value("${arooraa.project-enquiry.rate-limit.window-minutes:10}") long windowMinutes) {
        this.delegate = new InMemoryRateLimiter(maxRequests, windowMinutes);
    }

    public boolean tryAcquire(String key) {
        return delegate.tryAcquire(key);
    }
}
