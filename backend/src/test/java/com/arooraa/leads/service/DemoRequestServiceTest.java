package com.arooraa.leads.service;

import com.arooraa.leads.domain.DemoRequest;
import com.arooraa.leads.domain.LeadStatus;
import com.arooraa.leads.domain.NotificationStatus;
import com.arooraa.leads.domain.OutletCount;
import com.arooraa.leads.domain.PrimaryChallenge;
import com.arooraa.leads.domain.RestaurantType;
import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.repository.DemoRequestRepository;
import com.arooraa.leads.web.dto.DemoRequestCreateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DemoRequestServiceTest {

    private DemoRequestRepository repository;
    private InMemoryRateLimiter rateLimiter;
    private DemoRequestService service;

    @BeforeEach
    void setUp() {
        repository = mock(DemoRequestRepository.class);
        rateLimiter = mock(InMemoryRateLimiter.class);
        when(rateLimiter.tryAcquire(anyString())).thenReturn(true);
        service = new DemoRequestService(repository, rateLimiter, 5);
    }

    private DemoRequestCreateRequest sampleRequest() {
        return new DemoRequestCreateRequest(
                "Priya Sharma", "Spice Route", "9876543210", "Chennai",
                OutletCount.ONE, RestaurantType.CASUAL_DINING, PrimaryChallenge.BILLING_POS,
                null, null, null, null, null, null, null, null, null, null, null);
    }

    @Test
    void savesNewRequestWithGeneratedUuidAndNewStatusWhenNoDuplicateExists() {
        when(repository.findRecentDuplicates(eq("+919876543210"), eq("Spice Route"), any())).thenReturn(List.of());
        when(repository.save(any(DemoRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitOutcome outcome = service.submit(sampleRequest(), "hashed-ip", "JUnit-Agent");

        assertInstanceOf(SubmitOutcome.Created.class, outcome);

        ArgumentCaptor<DemoRequest> captor = ArgumentCaptor.forClass(DemoRequest.class);
        verify(repository).save(captor.capture());
        DemoRequest saved = captor.getValue();

        assertEquals(LeadStatus.NEW, saved.getStatus());
        assertEquals(NotificationStatus.PENDING, saved.getNotificationStatus());
        assertEquals("+919876543210", saved.getNormalizedWhatsappNumber());
        assertEquals("hashed-ip", saved.getIpHash());
        assertEquals(saved.getId(), outcome.body().requestId());
    }

    @Test
    void returnsDuplicateOutcomeWithoutSavingWhenRecentMatchExists() {
        DemoRequest existing = new DemoRequest(
                "Priya Sharma", "Spice Route", "+919876543210", null, "Chennai",
                OutletCount.ONE, RestaurantType.CASUAL_DINING, PrimaryChallenge.BILLING_POS,
                null, null, null, null, null, "hashed-ip", "JUnit-Agent", null, null, null, null);

        when(repository.findRecentDuplicates(eq("+919876543210"), eq("Spice Route"), any()))
                .thenReturn(List.of(existing));

        SubmitOutcome outcome = service.submit(sampleRequest(), "hashed-ip", "JUnit-Agent");

        assertInstanceOf(SubmitOutcome.DuplicateDetected.class, outcome);
        assertEquals(existing.getId(), outcome.body().requestId());
        verify(repository, never()).save(any());
    }

    @Test
    void throwsRateLimitExceptionWhenLimiterRejects() {
        when(rateLimiter.tryAcquire(anyString())).thenReturn(false);

        assertThrows(RateLimitExceededException.class,
                () -> service.submit(sampleRequest(), "hashed-ip", "JUnit-Agent"));

        verify(repository, never()).save(any());
    }
}
