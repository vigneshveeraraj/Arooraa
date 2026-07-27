package com.arooraa.leads.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InMemoryRateLimiterTest {

    @Test
    void allowsRequestsUpToConfiguredLimit() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter(3, 10);

        assertTrue(limiter.tryAcquire("client-a"));
        assertTrue(limiter.tryAcquire("client-a"));
        assertTrue(limiter.tryAcquire("client-a"));
        assertFalse(limiter.tryAcquire("client-a"));
    }

    @Test
    void tracksEachKeyIndependently() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter(1, 10);

        assertTrue(limiter.tryAcquire("client-a"));
        assertTrue(limiter.tryAcquire("client-b"));
        assertFalse(limiter.tryAcquire("client-a"));
        assertFalse(limiter.tryAcquire("client-b"));
    }
}
