package com.arooraa.leads.contact.service;

import com.arooraa.leads.contact.domain.ContactMessage;
import com.arooraa.leads.contact.domain.ContactProduct;
import com.arooraa.leads.contact.domain.ContactReason;
import com.arooraa.leads.contact.exception.ContactIdempotencyConflictException;
import com.arooraa.leads.contact.notification.service.ContactNotificationService;
import com.arooraa.leads.contact.repository.ContactMessageRepository;
import com.arooraa.leads.contact.web.dto.ContactMessageCreateRequest;
import com.arooraa.leads.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ContactMessageServiceTest {

    private ContactMessageRepository repository;
    private ContactReferenceGenerator referenceGenerator;
    private ContactMessageRateLimiter rateLimiter;
    private ContactNotificationService notificationService;
    private ContactMessageService service;

    @BeforeEach
    void setUp() {
        repository = mock(ContactMessageRepository.class);
        referenceGenerator = mock(ContactReferenceGenerator.class);
        rateLimiter = mock(ContactMessageRateLimiter.class);
        notificationService = mock(ContactNotificationService.class);
        when(rateLimiter.tryAcquire(anyString())).thenReturn(true);
        when(referenceGenerator.next()).thenReturn("CNT-2026-000001");
        when(repository.save(any(ContactMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        service = new ContactMessageService(repository, referenceGenerator, rateLimiter, notificationService);
    }

    private static ContactMessageCreateRequest request(ContactReason reason, ContactProduct product) {
        return new ContactMessageCreateRequest("Priya Sharma", "priya@example.com", "+919876543210", "Acme Co",
                reason, product, "I'd like to ask about a partnership opportunity with AROORAA.", "");
    }

    @Test
    void savesNewMessageWithGeneratedReferenceAndCreatesNotificationIntents() {
        ContactMessageSubmitOutcome outcome = service.submit(request(ContactReason.PARTNERSHIP, null), "hashed-ip", null);

        assertInstanceOf(ContactMessageSubmitOutcome.Created.class, outcome);
        assertEquals("CNT-2026-000001", outcome.body().contactReference());

        ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
        verify(repository).save(captor.capture());
        assertEquals(ContactReason.PARTNERSHIP, captor.getValue().getReason());
        assertEquals("hashed-ip", captor.getValue().getIpHash());
        verify(notificationService).createIntents(captor.getValue());
    }

    @Test
    void neverRequiresProductForANonProductReason() {
        ContactMessageSubmitOutcome outcome = service.submit(request(ContactReason.GENERAL, null), "hashed-ip", null);
        assertInstanceOf(ContactMessageSubmitOutcome.Created.class, outcome);
    }

    @Test
    void acceptsAnOptionalProductForAProductQuestion() {
        service.submit(request(ContactReason.PRODUCT_QUESTION, ContactProduct.MESA), "hashed-ip", null);

        ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
        verify(repository).save(captor.capture());
        assertEquals(ContactProduct.MESA, captor.getValue().getProduct());
    }

    @Test
    void rejectsRateLimitedRequestsBeforeTouchingPersistence() {
        when(rateLimiter.tryAcquire(anyString())).thenReturn(false);

        assertThrows(RateLimitExceededException.class,
                () -> service.submit(request(ContactReason.GENERAL, null), "hashed-ip", null));

        verify(repository, never()).save(any());
        verify(notificationService, never()).createIntents(any());
    }

    @Test
    void idempotentReplayWithMatchingFingerprintReturnsExistingReferenceWithoutCreatingANewRow() {
        ContactMessageCreateRequest req = request(ContactReason.PARTNERSHIP, null);
        String fingerprint = RequestFingerprint.of(req);
        ContactMessage existing = new ContactMessage("CNT-2026-000002", "Priya Sharma", "priya@example.com",
                "+919876543210", "Acme Co", ContactReason.PARTNERSHIP, null, req.message(), "hashed-ip");
        existing.applyIdempotency("client-key-1", fingerprint);
        when(repository.findByIdempotencyKey("client-key-1")).thenReturn(Optional.of(existing));

        ContactMessageSubmitOutcome outcome = service.submit(req, "hashed-ip", "client-key-1");

        assertInstanceOf(ContactMessageSubmitOutcome.DuplicateDetected.class, outcome);
        assertEquals("CNT-2026-000002", outcome.body().contactReference());
        verify(repository, never()).save(any());
        verify(notificationService, never()).createIntents(any());
    }

    @Test
    void idempotencyKeyReusedWithDifferentPayloadIsAConflict() {
        ContactMessage existing = new ContactMessage("CNT-2026-000003", "Priya Sharma", "priya@example.com",
                null, null, ContactReason.GENERAL, null, "Original message.", "hashed-ip");
        existing.applyIdempotency("client-key-2", "a-different-stored-fingerprint");
        when(repository.findByIdempotencyKey("client-key-2")).thenReturn(Optional.of(existing));

        assertThrows(ContactIdempotencyConflictException.class,
                () -> service.submit(request(ContactReason.GENERAL, null), "hashed-ip", "client-key-2"));

        verify(repository, never()).save(any());
    }
}
