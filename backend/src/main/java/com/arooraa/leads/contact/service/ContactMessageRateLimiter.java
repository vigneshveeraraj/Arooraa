package com.arooraa.leads.contact.service;

import com.arooraa.leads.service.InMemoryRateLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Own state/config — Contact traffic must never count against, or be limited by, any other public endpoint. */
@Component
public class ContactMessageRateLimiter {

    private final InMemoryRateLimiter delegate;

    public ContactMessageRateLimiter(
            @Value("${arooraa.contact.rate-limit.max-requests:5}") int maxRequests,
            @Value("${arooraa.contact.rate-limit.window-minutes:10}") long windowMinutes) {
        this.delegate = new InMemoryRateLimiter(maxRequests, windowMinutes);
    }

    public boolean tryAcquire(String key) {
        return delegate.tryAcquire(key);
    }
}
