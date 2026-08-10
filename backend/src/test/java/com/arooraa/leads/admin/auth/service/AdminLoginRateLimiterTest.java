package com.arooraa.leads.admin.auth.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdminLoginRateLimiterTest {

    @Test
    void allowsUpToMaxAttemptsThenBlocks() {
        AdminLoginRateLimiter limiter = new AdminLoginRateLimiter(3, 15);

        assertTrue(limiter.tryAcquire("owner@arooraa.test"));
        assertTrue(limiter.tryAcquire("owner@arooraa.test"));
        assertTrue(limiter.tryAcquire("owner@arooraa.test"));
        assertFalse(limiter.tryAcquire("owner@arooraa.test"));
    }

    @Test
    void isCaseInsensitiveOnEmail() {
        AdminLoginRateLimiter limiter = new AdminLoginRateLimiter(1, 15);

        assertTrue(limiter.tryAcquire("Owner@Arooraa.test"));
        assertFalse(limiter.tryAcquire("owner@arooraa.test"), "same email in a different case must share the bucket");
    }

    @Test
    void tracksIndependentBucketsPerEmail() {
        AdminLoginRateLimiter limiter = new AdminLoginRateLimiter(1, 15);

        assertTrue(limiter.tryAcquire("a@arooraa.test"));
        assertTrue(limiter.tryAcquire("b@arooraa.test"), "a different email must have its own budget");
    }
}
