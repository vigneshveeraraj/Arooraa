package com.arooraa.leads.careers.service;

import com.arooraa.leads.careers.domain.AreaOfInterest;
import com.arooraa.leads.careers.domain.TalentSubscription;
import com.arooraa.leads.careers.repository.TalentSubscriptionRepository;
import com.arooraa.leads.careers.web.dto.TalentSubscriptionCreateRequest;
import com.arooraa.leads.careers.web.dto.TalentSubscriptionResponse;
import com.arooraa.leads.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TalentSubscriptionServiceTest {

    private TalentSubscriptionRepository repository;
    private TalentSubscriptionRateLimiter rateLimiter;
    private TalentSubscriptionService service;

    @BeforeEach
    void setUp() {
        repository = mock(TalentSubscriptionRepository.class);
        rateLimiter = mock(TalentSubscriptionRateLimiter.class);
        when(rateLimiter.tryAcquire(anyString())).thenReturn(true);
        service = new TalentSubscriptionService(repository, rateLimiter);
    }

    private static TalentSubscriptionCreateRequest request(String email) {
        return new TalentSubscriptionCreateRequest("Priya Sharma", email,
                List.of(AreaOfInterest.AI_DATA, AreaOfInterest.BACKEND_FULL_STACK), "EXPERIENCED", true);
    }

    @Test
    void createsANewSubscriptionWhenNoneExistsForThisEmail() {
        when(repository.findByEmail("priya@example.com")).thenReturn(Optional.empty());

        TalentSubscriptionResponse response = service.subscribe(request("priya@example.com"), "hashed-ip");

        assertEquals(TalentSubscriptionResponse.STATUS_SUBSCRIBED, response.status());
        ArgumentCaptor<TalentSubscription> captor = ArgumentCaptor.forClass(TalentSubscription.class);
        verify(repository).save(captor.capture());
        assertEquals("priya@example.com", captor.getValue().getEmail());
        assertTrue(captor.getValue().getAreasOfInterest().contains(AreaOfInterest.AI_DATA));
    }

    @Test
    void normalizesEmailCaseForLookupAndStorage() {
        when(repository.findByEmail("priya@example.com")).thenReturn(Optional.empty());

        service.subscribe(request("Priya@Example.com"), "hashed-ip");

        verify(repository).findByEmail("priya@example.com");
    }

    @Test
    void resubmittingTheSameEmailUpdatesTheExistingRowInsteadOfCreatingADuplicate() {
        TalentSubscription existing = new TalentSubscription("priya@example.com", "Old Name",
                java.util.Set.of(AreaOfInterest.SALES), null, true);
        when(repository.findByEmail("priya@example.com")).thenReturn(Optional.of(existing));

        service.subscribe(request("priya@example.com"), "hashed-ip");

        verify(repository, never()).save(org.mockito.ArgumentMatchers.argThat(s -> s != existing));
        verify(repository).save(existing);
        assertEquals("Priya Sharma", existing.getName());
        assertTrue(existing.getAreasOfInterest().contains(AreaOfInterest.AI_DATA));
    }

    @Test
    void rateLimitedRequestIsRejected() {
        when(rateLimiter.tryAcquire(anyString())).thenReturn(false);

        assertThrows(RateLimitExceededException.class, () -> service.subscribe(request("priya@example.com"), "hashed-ip"));

        verify(repository, never()).findByEmail(anyString());
    }
}
