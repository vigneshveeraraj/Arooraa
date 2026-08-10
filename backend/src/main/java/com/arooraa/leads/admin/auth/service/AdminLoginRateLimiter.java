package com.arooraa.leads.admin.auth.service;

import com.arooraa.leads.service.InMemoryRateLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Temporary brute-force throttle keyed by the attempted (lowercased) email, not IP —
 * this protects a specific admin account regardless of the attacker's IP, which matters
 * more for a single/small admin roster than a pure per-IP limit. Never permanently locks
 * the account: it is the same sliding-window algorithm used for public endpoints, wrapped
 * privately so its state and config are independent of them.
 */
@Component
public class AdminLoginRateLimiter {

    private final InMemoryRateLimiter delegate;

    public AdminLoginRateLimiter(
            @Value("${arooraa.admin.login-rate-limit.max-attempts:5}") int maxAttempts,
            @Value("${arooraa.admin.login-rate-limit.window-minutes:15}") long windowMinutes) {
        this.delegate = new InMemoryRateLimiter(maxAttempts, windowMinutes);
    }

    public boolean tryAcquire(String email) {
        return delegate.tryAcquire(email.toLowerCase(java.util.Locale.ROOT));
    }
}
