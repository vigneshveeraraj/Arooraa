package com.arooraa.leads.capture.service;

import com.arooraa.leads.capture.domain.ConsentSource;
import com.arooraa.leads.capture.domain.LeadCapture;
import com.arooraa.leads.capture.domain.LeadCaptureStatus;
import com.arooraa.leads.capture.domain.LeadLanguage;
import com.arooraa.leads.capture.domain.LeadRequirement;
import com.arooraa.leads.capture.domain.LeadSource;
import com.arooraa.leads.capture.exception.LeadCaptureIdempotencyConflictException;
import com.arooraa.leads.capture.repository.LeadCaptureRepository;
import com.arooraa.leads.capture.web.dto.LeadCaptureCreateRequest;
import com.arooraa.leads.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LeadCaptureServiceTest {

    private static final String CONSENT = "I agree that AROORAA may contact me about this enquiry.";

    private LeadCaptureRepository repository;
    private LeadReferenceGenerator referenceGenerator;
    private LeadCaptureRateLimiter rateLimiter;
    private LeadCaptureService service;

    @BeforeEach
    void setUp() {
        repository = mock(LeadCaptureRepository.class);
        referenceGenerator = mock(LeadReferenceGenerator.class);
        rateLimiter = mock(LeadCaptureRateLimiter.class);
        when(rateLimiter.tryAcquire(anyString())).thenReturn(true);
        when(referenceGenerator.next()).thenReturn("LC-7Q2M9X");
        when(repository.saveAndFlush(any(LeadCapture.class))).thenAnswer(invocation -> invocation.getArgument(0));
        service = new LeadCaptureService(repository, referenceGenerator, rateLimiter);
    }

    static LeadCaptureCreateRequest request(String phone, LeadRequirement requirement) {
        return new LeadCaptureCreateRequest(requirement, phone, "IN", true, CONSENT, "ta", "WEBSITE",
                "/ta/grow-your-business", "https://www.google.com/", "google", "cpc", "tn-growth", "hero", "");
    }

    @Test
    void savesANewLeadWithNormalisedPhoneRecordedConsentAndAttribution() {
        LeadCaptureSubmitOutcome outcome = service.submit(request("98765 43210", LeadRequirement.WEBSITE), "hashed-ip", null);

        assertInstanceOf(LeadCaptureSubmitOutcome.Created.class, outcome);
        assertEquals("LC-7Q2M9X", outcome.body().leadReference());

        ArgumentCaptor<LeadCapture> captor = ArgumentCaptor.forClass(LeadCapture.class);
        verify(repository).saveAndFlush(captor.capture());
        LeadCapture saved = captor.getValue();
        assertEquals("+919876543210", saved.getPhone());
        assertEquals("IN", saved.getCountryCode());
        assertEquals(LeadRequirement.WEBSITE, saved.getRequirement());
        assertTrue(saved.isConsentGiven());
        assertEquals(CONSENT, saved.getConsentText());
        assertEquals(ConsentSource.WEB_FORM, saved.getConsentSource());
        assertEquals(LeadLanguage.TA, saved.getSourceLocale());
        assertNull(saved.getPreferredLanguage(), "the conversation sets this, never the form");
        assertEquals(LeadSource.WEBSITE, saved.getSource());
        assertEquals(LeadCaptureStatus.NEW, saved.getStatus());
        assertEquals("/ta/grow-your-business", saved.getSourcePage());
        assertEquals("tn-growth", saved.getUtmCampaign());
        assertEquals("hashed-ip", saved.getIpHash());
        assertNull(saved.getIdempotencyKey());
    }

    @Test
    void rateLimitedSubmissionIsRejectedBeforeAnythingIsSaved() {
        when(rateLimiter.tryAcquire("hashed-ip")).thenReturn(false);

        assertThrows(RateLimitExceededException.class,
                () -> service.submit(request("+919876543210", LeadRequirement.WEBSITE), "hashed-ip", "key-1"));
        verify(repository, never()).saveAndFlush(any());
        verify(repository, never()).findByIdempotencyKey(any());
    }

    @Test
    void storesTheIdempotencyKeyAndFingerprintOnFirstSubmission() {
        when(repository.findByIdempotencyKey("key-1")).thenReturn(Optional.empty());

        service.submit(request("+919876543210", LeadRequirement.WEBSITE), "hashed-ip", "  key-1  ");

        ArgumentCaptor<LeadCapture> captor = ArgumentCaptor.forClass(LeadCapture.class);
        verify(repository).saveAndFlush(captor.capture());
        assertEquals("key-1", captor.getValue().getIdempotencyKey());
        assertEquals(64, captor.getValue().getRequestFingerprint().length());
    }

    @Test
    void sameKeyAndSameLeadReplaysTheOriginalReference() {
        LeadCapture original = savedWithKey(request("+919876543210", LeadRequirement.WEBSITE), "key-1");
        when(repository.findByIdempotencyKey("key-1")).thenReturn(Optional.of(original));

        // Same lead, phone typed differently: still the same request.
        LeadCaptureSubmitOutcome outcome = service.submit(request("9876543210", LeadRequirement.WEBSITE), "hashed-ip", "key-1");

        assertInstanceOf(LeadCaptureSubmitOutcome.DuplicateDetected.class, outcome);
        assertEquals(original.getLeadReference(), outcome.body().leadReference());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void sameKeyWithADifferentLeadIsAConflict() {
        LeadCapture original = savedWithKey(request("+919876543210", LeadRequirement.WEBSITE), "key-1");
        when(repository.findByIdempotencyKey("key-1")).thenReturn(Optional.of(original));

        assertThrows(LeadCaptureIdempotencyConflictException.class,
                () -> service.submit(request("+919876543210", LeadRequirement.AI_AUTOMATION), "hashed-ip", "key-1"));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void anOversizedOrBlankKeyIsTreatedAsNoKey() {
        service.submit(request("+919876543210", LeadRequirement.WEBSITE), "hashed-ip", "x".repeat(101));
        service.submit(request("+919876543210", LeadRequirement.WEBSITE), "hashed-ip", "   ");

        verify(repository, never()).findByIdempotencyKey(any());
    }

    @Test
    void lostConcurrentInsertReplaysTheWinner() {
        LeadCapture winner = savedWithKey(request("+919876543210", LeadRequirement.WEBSITE), "key-1");
        when(repository.findByIdempotencyKey("key-1")).thenReturn(Optional.of(winner));

        Optional<LeadCaptureSubmitOutcome> outcome =
                service.replayAfterConcurrentInsert(request("+919876543210", LeadRequirement.WEBSITE), "key-1");

        assertInstanceOf(LeadCaptureSubmitOutcome.DuplicateDetected.class, outcome.orElseThrow());
        assertTrue(service.replayAfterConcurrentInsert(request("+919876543210", LeadRequirement.WEBSITE), null).isEmpty());
    }

    private static LeadCapture savedWithKey(LeadCaptureCreateRequest request, String key) {
        LeadCapture lead = LeadCapture.fromWebForm("LC-ABCDEF", request.requirement(), "+919876543210",
                request.consentText(), LeadLanguage.TA,
                new LeadCapture.Attribution(null, null, null, null, null, null), "hashed-ip");
        lead.applyIdempotency(key, RequestFingerprint.of(request));
        return lead;
    }
}
