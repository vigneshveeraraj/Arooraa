package com.arooraa.leads.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Single-instance sliding-window limiter keyed by (already-hashed) client identity.
 * Deliberately in-memory per Milestone 1 scope; a multi-instance deployment would need
 * a shared store instead.
 */
@Component
public class InMemoryRateLimiter {

    private final int maxRequests;
    private final Duration window;
    private final ConcurrentMap<String, Deque<Instant>> hits = new ConcurrentHashMap<>();

    public InMemoryRateLimiter(
            @Value("${arooraa.rate-limit.max-requests:5}") int maxRequests,
            @Value("${arooraa.rate-limit.window-minutes:10}") long windowMinutes) {
        this.maxRequests = maxRequests;
        this.window = Duration.ofMinutes(windowMinutes);
    }

    public boolean tryAcquire(String key) {
        Deque<Instant> deque = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        Instant now = Instant.now();
        synchronized (deque) {
            Instant windowStart = now.minus(window);
            while (!deque.isEmpty() && deque.peekFirst().isBefore(windowStart)) {
                deque.pollFirst();
            }
            if (deque.size() >= maxRequests) {
                return false;
            }
            deque.addLast(now);
            return true;
        }
    }
}
