package com.arooraa.leads.project.service;

import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.EngagementModel;
import com.arooraa.leads.project.domain.EnquiryStatus;
import com.arooraa.leads.project.domain.GuidedBudgetRange;
import com.arooraa.leads.project.domain.GuidedTimeline;
import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.ProductType;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.domain.ProjectStage;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.SolutionModel;
import com.arooraa.leads.project.domain.SubmissionVersion;
import com.arooraa.leads.project.domain.Timeline;
import com.arooraa.leads.project.exception.IdempotencyConflictException;
import com.arooraa.leads.project.notification.service.LeadNotificationService;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.project.web.dto.ProjectEnquiryCreateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProjectEnquiryServiceTest {

    private ProjectEnquiryRepository repository;
    private EnquiryNumberGenerator enquiryNumberGenerator;
    private ProjectEnquiryRateLimiter rateLimiter;
    private LeadNotificationService leadNotificationService;
    private ProjectEnquiryService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProjectEnquiryRepository.class);
        enquiryNumberGenerator = mock(EnquiryNumberGenerator.class);
        rateLimiter = mock(ProjectEnquiryRateLimiter.class);
        leadNotificationService = mock(LeadNotificationService.class);
        when(rateLimiter.tryAcquire(anyString())).thenReturn(true);
        when(enquiryNumberGenerator.next()).thenReturn("ARO-2026-000001");
        service = new ProjectEnquiryService(repository, enquiryNumberGenerator, rateLimiter, leadNotificationService, 5);
    }

    private ProjectEnquiryCreateRequest sampleRequest() {
        return new ProjectEnquiryCreateRequest(
                "Arun Kumar", "ABC Logistics", "arun@example.com", "+919876543210", "India",
                ServiceType.CUSTOM_SOFTWARE, ProjectType.NEW_PRODUCT,
                "We need a logistics tracking platform for our operations across five cities.", false,
                BudgetRange.FROM_2L_TO_5L, Timeline.FROM_1_TO_3_MONTHS, PreferredContactMethod.PHONE,
                "WEBSITE", "/start-project", null, null, null, null, "");
    }

    @Test
    void savesNewEnquiryWithGeneratedNumberAndNewStatusWhenNoDuplicateExists() {
        when(repository.findRecentDuplicates(eq("+919876543210"), eq("arun@example.com"), any()))
                .thenReturn(List.of());
        when(repository.save(any(ProjectEnquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectEnquirySubmitOutcome outcome = service.submit(sampleRequest(), "hashed-ip", "JUnit-Agent");

        assertInstanceOf(ProjectEnquirySubmitOutcome.Created.class, outcome);

        ArgumentCaptor<ProjectEnquiry> captor = ArgumentCaptor.forClass(ProjectEnquiry.class);
        verify(repository).save(captor.capture());
        ProjectEnquiry saved = captor.getValue();

        assertEquals(EnquiryStatus.NEW, saved.getStatus());
        assertEquals("ARO-2026-000001", saved.getEnquiryNumber());
        assertEquals("+919876543210", saved.getNormalizedPhone());
        assertEquals("hashed-ip", saved.getIpHash());
        assertEquals(saved.getEnquiryNumber(), outcome.body().enquiryNumber());
    }

    @Test
    void returnsDuplicateOutcomeWithoutSavingOrGeneratingNewNumberWhenRecentMatchExists() {
        ProjectEnquiry existing = new ProjectEnquiry(
                "ARO-2026-000042", "Arun Kumar", "ABC Logistics", "arun@example.com", "+919876543210",
                "+919876543210", "India", ServiceType.CUSTOM_SOFTWARE, ProjectType.NEW_PRODUCT,
                "We need a logistics tracking platform for our operations across five cities.", false,
                BudgetRange.FROM_2L_TO_5L, Timeline.FROM_1_TO_3_MONTHS, PreferredContactMethod.PHONE,
                "WEBSITE", "/start-project", "hashed-ip", "JUnit-Agent", null, null, null, null);

        when(repository.findRecentDuplicates(eq("+919876543210"), eq("arun@example.com"), any()))
                .thenReturn(List.of(existing));

        ProjectEnquirySubmitOutcome outcome = service.submit(sampleRequest(), "hashed-ip", "JUnit-Agent");

        assertInstanceOf(ProjectEnquirySubmitOutcome.DuplicateDetected.class, outcome);
        assertEquals("ARO-2026-000042", outcome.body().enquiryNumber());
        verify(repository, never()).save(any());
        verify(enquiryNumberGenerator, never()).next();
    }

    @Test
    void throwsRateLimitExceptionWhenLimiterRejects() {
        when(rateLimiter.tryAcquire(anyString())).thenReturn(false);

        assertThrows(RateLimitExceededException.class,
                () -> service.submit(sampleRequest(), "hashed-ip", "JUnit-Agent"));

        verify(repository, never()).save(any());
    }

    private ProjectEnquiryCreateRequest guidedRequest() {
        return new ProjectEnquiryCreateRequest(
                SubmissionVersion.GUIDED, "Priya Nair", "Nair Foods", "priya@example.com", "+919876500200",
                "India", "IN", "Founder",
                null, null, null, null, null, null,
                SolutionModel.NEW_PRODUCT, EngagementModel.DESIGN_BUILD,
                "We want to launch a new customer ordering app for our restaurant chain.", ProjectStage.IDEA,
                List.of(ProductType.MOBILE_APPLICATION), GuidedTimeline.WITHIN_1_TO_3_MONTHS,
                GuidedBudgetRange.UNDER_5L, null,
                PreferredContactMethod.EMAIL, null, true,
                "WEBSITE", "/start-project", null, null, null, null, null, null, null,
                "");
    }

    @Test
    void savesGuidedEnquiryWithGuidedFieldsPopulatedAndLegacyFieldsNull() {
        when(repository.findByIdempotencyKey("guided-key-1")).thenReturn(Optional.empty());
        when(repository.save(any(ProjectEnquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectEnquirySubmitOutcome outcome =
                service.submit(guidedRequest(), "hashed-ip", "JUnit-Agent", "guided-key-1");

        assertInstanceOf(ProjectEnquirySubmitOutcome.Created.class, outcome);
        ArgumentCaptor<ProjectEnquiry> captor = ArgumentCaptor.forClass(ProjectEnquiry.class);
        verify(repository).save(captor.capture());
        ProjectEnquiry saved = captor.getValue();

        assertEquals(SubmissionVersion.GUIDED, saved.getSubmissionVersion());
        assertEquals(SolutionModel.NEW_PRODUCT, saved.getSolutionModel());
        assertEquals(EnquiryStatus.NEW, saved.getStatus());
        assertNull(saved.getServiceType());
        assertNull(saved.getProjectType());
        assertNull(saved.getDescription());
        assertNull(saved.getBudgetRange());
        assertNull(saved.getTimeline());
        assertEquals("guided-key-1", saved.getIdempotencyKey());
        assertTrue(saved.getRequestFingerprint() != null && saved.getRequestFingerprint().length() == 64);
    }

    @Test
    void idempotencyKeyReplayWithMatchingPayloadReturnsSameOutcomeWithoutSavingAgain() {
        ProjectEnquiryCreateRequest request = guidedRequest();
        String fingerprint = RequestFingerprint.of(request);
        ProjectEnquiry existing = new ProjectEnquiry(
                "ARO-2026-000099", "Priya Nair", "Nair Foods", "priya@example.com", "+919876500200",
                "+919876500200", "India", null, null, null, null, null, null, PreferredContactMethod.EMAIL,
                "WEBSITE", "/start-project", "hashed-ip", "JUnit-Agent", null, null, null, null);
        existing.applyIdempotency("guided-key-1", fingerprint);

        when(repository.findByIdempotencyKey("guided-key-1")).thenReturn(Optional.of(existing));

        ProjectEnquirySubmitOutcome outcome = service.submit(request, "hashed-ip", "JUnit-Agent", "guided-key-1");

        assertInstanceOf(ProjectEnquirySubmitOutcome.DuplicateDetected.class, outcome);
        assertEquals("ARO-2026-000099", outcome.body().enquiryNumber());
        verify(repository, never()).save(any());
        verify(enquiryNumberGenerator, never()).next();
    }

    @Test
    void idempotencyKeyReusedWithDifferentPayloadThrowsConflictAndDoesNotSave() {
        ProjectEnquiry existing = new ProjectEnquiry(
                "ARO-2026-000099", "Priya Nair", "Nair Foods", "priya@example.com", "+919876500200",
                "+919876500200", "India", null, null, null, null, null, null, PreferredContactMethod.EMAIL,
                "WEBSITE", "/start-project", "hashed-ip", "JUnit-Agent", null, null, null, null);
        existing.applyIdempotency("guided-key-1", "a-completely-different-stored-fingerprint");

        when(repository.findByIdempotencyKey("guided-key-1")).thenReturn(Optional.of(existing));

        assertThrows(IdempotencyConflictException.class,
                () -> service.submit(guidedRequest(), "hashed-ip", "JUnit-Agent", "guided-key-1"));

        verify(repository, never()).save(any());
    }

    @Test
    void idempotencyKeyPresentSkipsTheLegacyTimeWindowDuplicateHeuristic() {
        when(repository.findByIdempotencyKey("guided-key-1")).thenReturn(Optional.empty());
        when(repository.save(any(ProjectEnquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.submit(guidedRequest(), "hashed-ip", "JUnit-Agent", "guided-key-1");

        verify(repository, never()).findRecentDuplicates(any(), any(), any());
    }

    @Test
    void blankIdempotencyKeyFallsBackToTheLegacyTimeWindowDuplicateHeuristic() {
        when(repository.findRecentDuplicates(eq("+919876543210"), eq("arun@example.com"), any()))
                .thenReturn(List.of());
        when(repository.save(any(ProjectEnquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectEnquirySubmitOutcome outcome = service.submit(sampleRequest(), "hashed-ip", "JUnit-Agent", "   ");

        assertInstanceOf(ProjectEnquirySubmitOutcome.Created.class, outcome);
        verify(repository, never()).findByIdempotencyKey(any());
    }

    // --- W3.2C: notification-outbox creation is called exactly once per genuinely new enquiry,
    // and never on any path that returns an already-existing enquiry. ---

    @Test
    void newLegacyEnquiryCreatesNotificationIntentsForTheSavedEntity() {
        when(repository.findRecentDuplicates(any(), any(), any())).thenReturn(List.of());
        when(repository.save(any(ProjectEnquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.submit(sampleRequest(), "hashed-ip", "JUnit-Agent");

        ArgumentCaptor<ProjectEnquiry> captor = ArgumentCaptor.forClass(ProjectEnquiry.class);
        verify(leadNotificationService).createIntents(captor.capture());
        assertEquals("ARO-2026-000001", captor.getValue().getEnquiryNumber());
    }

    @Test
    void newGuidedEnquiryCreatesNotificationIntents() {
        when(repository.findByIdempotencyKey("guided-key-1")).thenReturn(Optional.empty());
        when(repository.save(any(ProjectEnquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.submit(guidedRequest(), "hashed-ip", "JUnit-Agent", "guided-key-1");

        verify(leadNotificationService).createIntents(any(ProjectEnquiry.class));
    }

    @Test
    void legacyDuplicateHeuristicHitDoesNotCreateNotificationIntents() {
        ProjectEnquiry existing = new ProjectEnquiry(
                "ARO-2026-000042", "Arun Kumar", "ABC Logistics", "arun@example.com", "+919876543210",
                "+919876543210", "India", ServiceType.CUSTOM_SOFTWARE, ProjectType.NEW_PRODUCT,
                "We need a logistics tracking platform for our operations across five cities.", false,
                BudgetRange.FROM_2L_TO_5L, Timeline.FROM_1_TO_3_MONTHS, PreferredContactMethod.PHONE,
                "WEBSITE", "/start-project", "hashed-ip", "JUnit-Agent", null, null, null, null);
        when(repository.findRecentDuplicates(eq("+919876543210"), eq("arun@example.com"), any()))
                .thenReturn(List.of(existing));

        service.submit(sampleRequest(), "hashed-ip", "JUnit-Agent");

        verify(leadNotificationService, never()).createIntents(any());
    }

    @Test
    void idempotencyReplayDoesNotCreateAnotherSetOfNotificationIntents() {
        ProjectEnquiryCreateRequest request = guidedRequest();
        String fingerprint = RequestFingerprint.of(request);
        ProjectEnquiry existing = new ProjectEnquiry(
                "ARO-2026-000099", "Priya Nair", "Nair Foods", "priya@example.com", "+919876500200",
                "+919876500200", "India", null, null, null, null, null, null, PreferredContactMethod.EMAIL,
                "WEBSITE", "/start-project", "hashed-ip", "JUnit-Agent", null, null, null, null);
        existing.applyIdempotency("guided-key-1", fingerprint);
        when(repository.findByIdempotencyKey("guided-key-1")).thenReturn(Optional.of(existing));

        service.submit(request, "hashed-ip", "JUnit-Agent", "guided-key-1");

        verify(leadNotificationService, never()).createIntents(any());
    }

    @Test
    void idempotencyConflictDoesNotCreateNotificationIntents() {
        ProjectEnquiry existing = new ProjectEnquiry(
                "ARO-2026-000099", "Priya Nair", "Nair Foods", "priya@example.com", "+919876500200",
                "+919876500200", "India", null, null, null, null, null, null, PreferredContactMethod.EMAIL,
                "WEBSITE", "/start-project", "hashed-ip", "JUnit-Agent", null, null, null, null);
        existing.applyIdempotency("guided-key-1", "a-completely-different-stored-fingerprint");
        when(repository.findByIdempotencyKey("guided-key-1")).thenReturn(Optional.of(existing));

        assertThrows(IdempotencyConflictException.class,
                () -> service.submit(guidedRequest(), "hashed-ip", "JUnit-Agent", "guided-key-1"));

        verify(leadNotificationService, never()).createIntents(any());
    }
}
