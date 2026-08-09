package com.arooraa.leads.project.service;

import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.EnquiryStatus;
import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.Timeline;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.project.web.dto.ProjectEnquiryCreateRequest;
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

class ProjectEnquiryServiceTest {

    private ProjectEnquiryRepository repository;
    private EnquiryNumberGenerator enquiryNumberGenerator;
    private ProjectEnquiryRateLimiter rateLimiter;
    private ProjectEnquiryService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProjectEnquiryRepository.class);
        enquiryNumberGenerator = mock(EnquiryNumberGenerator.class);
        rateLimiter = mock(ProjectEnquiryRateLimiter.class);
        when(rateLimiter.tryAcquire(anyString())).thenReturn(true);
        when(enquiryNumberGenerator.next()).thenReturn("ARO-2026-000001");
        service = new ProjectEnquiryService(repository, enquiryNumberGenerator, rateLimiter, 5);
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
}
