package com.arooraa.leads.careers.service;

import com.arooraa.leads.careers.domain.JobApplication;
import com.arooraa.leads.careers.exception.RecruitmentIdempotencyConflictException;
import com.arooraa.leads.careers.exception.UnknownOrClosedJobException;
import com.arooraa.leads.careers.registry.RecruitmentJob;
import com.arooraa.leads.careers.registry.RecruitmentJobRegistry;
import com.arooraa.leads.careers.repository.JobApplicationRepository;
import com.arooraa.leads.careers.storage.ResumeStorage;
import com.arooraa.leads.careers.storage.ResumeStorageException;
import com.arooraa.leads.careers.storage.ResumeValidator;
import com.arooraa.leads.careers.storage.ValidatedResume;
import com.arooraa.leads.careers.web.dto.JobApplicationCreateRequest;
import com.arooraa.leads.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class JobApplicationServiceTest {

    private RecruitmentJobRegistry jobRegistry;
    private JobApplicationRequestValidator requestValidator;
    private ResumeValidator resumeValidator;
    private ResumeStorage resumeStorage;
    private JobApplicationRepository repository;
    private JobApplicationPersistenceService persistenceService;
    private JobApplicationRateLimiter rateLimiter;
    private JobApplicationService service;

    private static final RecruitmentJob JOB = new RecruitmentJob("ai-engineer", "AI Engineer", true);

    @BeforeEach
    void setUp() {
        jobRegistry = mock(RecruitmentJobRegistry.class);
        requestValidator = mock(JobApplicationRequestValidator.class);
        resumeValidator = mock(ResumeValidator.class);
        resumeStorage = mock(ResumeStorage.class);
        repository = mock(JobApplicationRepository.class);
        persistenceService = mock(JobApplicationPersistenceService.class);
        rateLimiter = mock(JobApplicationRateLimiter.class);

        when(rateLimiter.tryAcquire(anyString())).thenReturn(true);
        when(jobRegistry.findAcceptingApplications("ai-engineer")).thenReturn(Optional.of(JOB));

        service = new JobApplicationService(jobRegistry, requestValidator, resumeValidator, resumeStorage,
                repository, persistenceService, rateLimiter);
    }

    private static JobApplicationCreateRequest request(String jobSlug) {
        return new JobApplicationCreateRequest(jobSlug, "Priya Sharma", "priya@example.com", "+919876543210",
                "Chennai", "3 years", null, null, null, true, null, null, null);
    }

    private static JobApplication fixtureApplication(String reference) {
        return new JobApplication(reference, "ai-engineer", "AI Engineer", "Priya Sharma", "priya@example.com",
                "+919876543210", null, null, null, null, null, true, "hashed-ip");
    }

    @Test
    void rateLimitedRequestNeverReachesValidationOrJobLookup() {
        when(rateLimiter.tryAcquire(anyString())).thenReturn(false);

        assertThrows(RateLimitExceededException.class,
                () -> service.submit(request("ai-engineer"), null, "hashed-ip", null));

        verifyNoInteractions(requestValidator, jobRegistry, resumeValidator, resumeStorage, persistenceService);
    }

    @Test
    void unknownJobIsRejectedBeforeAnyResumeOrStorageWork() {
        when(jobRegistry.findAcceptingApplications("not-a-real-role")).thenReturn(Optional.empty());
        MultipartFile resume = new MockMultipartFile("resume", "r.pdf", "application/pdf", "%PDF-1.4".getBytes());

        assertThrows(UnknownOrClosedJobException.class,
                () -> service.submit(request("not-a-real-role"), resume, "hashed-ip", null));

        verifyNoInteractions(resumeValidator, resumeStorage, persistenceService);
    }

    @Test
    void successfulSubmissionWithoutAResumeNeverTouchesStorage() {
        JobApplication saved = fixtureApplication("JOB-2026-000001");
        when(persistenceService.persist(any(), any(), any(), any(), anyString(), any(), any())).thenReturn(saved);

        var outcome = service.submit(request("ai-engineer"), null, "hashed-ip", null);

        assertInstanceOf(JobApplicationSubmitOutcome.Created.class, outcome);
        assertEquals("JOB-2026-000001", outcome.body().applicationReference());
        verifyNoInteractions(resumeValidator, resumeStorage);
    }

    @Test
    void successfulSubmissionWithAResumeStagesThenPromotesAfterPersistCommits() {
        MultipartFile resume = new MockMultipartFile("resume", "r.pdf", "application/pdf", "%PDF-1.4".getBytes());
        ValidatedResume validated = new ValidatedResume("%PDF-1.4".getBytes(), "r.pdf", "application/pdf", 8, "pdf");
        when(resumeValidator.validate(resume)).thenReturn(validated);
        when(resumeStorage.stage(validated)).thenReturn("generated-key.pdf");
        JobApplication saved = fixtureApplication("JOB-2026-000002");
        when(persistenceService.persist(any(), any(), any(), anyString(), anyString(), any(), any())).thenReturn(saved);

        var outcome = service.submit(request("ai-engineer"), resume, "hashed-ip", null);

        assertInstanceOf(JobApplicationSubmitOutcome.Created.class, outcome);
        verify(resumeStorage).promote("generated-key.pdf");
        verify(resumeStorage, never()).discard(anyString());
    }

    @Test
    void dbFailureDiscardsTheStagedResumeAndNeverPromotesIt() {
        MultipartFile resume = new MockMultipartFile("resume", "r.pdf", "application/pdf", "%PDF-1.4".getBytes());
        ValidatedResume validated = new ValidatedResume("%PDF-1.4".getBytes(), "r.pdf", "application/pdf", 8, "pdf");
        when(resumeValidator.validate(resume)).thenReturn(validated);
        when(resumeStorage.stage(validated)).thenReturn("generated-key.pdf");
        when(persistenceService.persist(any(), any(), any(), anyString(), anyString(), any(), any()))
                .thenThrow(new RuntimeException("db exploded"));

        assertThrows(RuntimeException.class, () -> service.submit(request("ai-engineer"), resume, "hashed-ip", null));

        verify(resumeStorage).discard("generated-key.pdf");
        verify(resumeStorage, never()).promote(anyString());
    }

    @Test
    void resumeStagingFailureNeverReachesPersistence() {
        MultipartFile resume = new MockMultipartFile("resume", "r.pdf", "application/pdf", "%PDF-1.4".getBytes());
        ValidatedResume validated = new ValidatedResume("%PDF-1.4".getBytes(), "r.pdf", "application/pdf", 8, "pdf");
        when(resumeValidator.validate(resume)).thenReturn(validated);
        when(resumeStorage.stage(validated)).thenThrow(new ResumeStorageException("disk full", new java.io.IOException()));

        assertThrows(ResumeStorageException.class, () -> service.submit(request("ai-engineer"), resume, "hashed-ip", null));

        verifyNoInteractions(persistenceService);
    }

    @Test
    void idempotentReplayWithMatchingFingerprintReturnsExistingReferenceWithoutTouchingStorageOrPersistence() {
        JobApplicationCreateRequest req = request("ai-engineer");
        String fingerprint = RequestFingerprint.of(req);
        JobApplication existing = fixtureApplication("JOB-2026-000003");
        existing.applyIdempotency("client-key-1", fingerprint);
        when(repository.findByIdempotencyKey("client-key-1")).thenReturn(Optional.of(existing));

        var outcome = service.submit(req, null, "hashed-ip", "client-key-1");

        assertInstanceOf(JobApplicationSubmitOutcome.DuplicateDetected.class, outcome);
        assertEquals("JOB-2026-000003", outcome.body().applicationReference());
        verifyNoInteractions(resumeValidator, resumeStorage, persistenceService);
    }

    @Test
    void idempotencyKeyReusedWithDifferentPayloadIsAConflict() {
        JobApplication existing = fixtureApplication("JOB-2026-000004");
        existing.applyIdempotency("client-key-2", "a-completely-different-stored-fingerprint");
        when(repository.findByIdempotencyKey("client-key-2")).thenReturn(Optional.of(existing));

        assertThrows(RecruitmentIdempotencyConflictException.class,
                () -> service.submit(request("ai-engineer"), null, "hashed-ip", "client-key-2"));

        verifyNoInteractions(resumeValidator, resumeStorage, persistenceService);
    }

    @Test
    void oversizedOrBlankIdempotencyKeyIsTreatedAsNoKeyAtAll() {
        JobApplication saved = fixtureApplication("JOB-2026-000005");
        when(persistenceService.persist(any(), any(), any(), any(), anyString(), any(), any())).thenReturn(saved);
        String hugeKey = "x".repeat(200);

        var outcome = service.submit(request("ai-engineer"), null, "hashed-ip", hugeKey);

        assertInstanceOf(JobApplicationSubmitOutcome.Created.class, outcome);
        verifyNoInteractions(repository);

        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        verify(persistenceService).persist(any(), any(), any(), any(), anyString(), keyCaptor.capture(), any());
        assertEquals(null, keyCaptor.getValue());
    }
}
