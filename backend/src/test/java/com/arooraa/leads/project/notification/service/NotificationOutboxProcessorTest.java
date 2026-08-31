package com.arooraa.leads.project.notification.service;

import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.Timeline;
import com.arooraa.leads.project.notification.domain.NotificationOutbox;
import com.arooraa.leads.project.notification.domain.NotificationOutboxStatus;
import com.arooraa.leads.project.notification.domain.NotificationType;
import com.arooraa.leads.project.notification.mail.MailGateway;
import com.arooraa.leads.project.notification.mail.MailMessage;
import com.arooraa.leads.project.notification.mail.PermanentMailDeliveryException;
import com.arooraa.leads.project.notification.mail.RetryableMailDeliveryException;
import com.arooraa.leads.project.notification.repository.NotificationOutboxRepository;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Pure unit coverage (no Spring context, no DB) for the claim/send/finalize decision logic —
 * retry backoff, permanent-vs-retryable classification, max-attempts exhaustion (W3.2C §53-54).
 * The DB-backed claiming/crash-recovery/concurrency behaviour is covered separately in
 * NotificationOutboxIT against a real Postgres instance.
 */
class NotificationOutboxProcessorTest {

    private NotificationOutboxRepository outboxRepository;
    private ProjectEnquiryRepository projectEnquiryRepository;
    private LeadNotificationService leadNotificationService;
    private MailGateway mailGateway;
    private NotificationOutboxProcessor processor;

    @BeforeEach
    void setUp() {
        outboxRepository = mock(NotificationOutboxRepository.class);
        projectEnquiryRepository = mock(ProjectEnquiryRepository.class);
        leadNotificationService = mock(LeadNotificationService.class);
        mailGateway = mock(MailGateway.class);
        processor = new NotificationOutboxProcessor(outboxRepository, projectEnquiryRepository,
                leadNotificationService, mailGateway);
    }

    private static ProjectEnquiry sampleEnquiry() {
        return new ProjectEnquiry(
                "ARO-2026-000001", "Arun Kumar", "ABC Logistics", "arun@example.com", "+919876543210",
                "+919876543210", "India", ServiceType.CUSTOM_SOFTWARE, ProjectType.NEW_PRODUCT,
                "We need a logistics tracking platform.", false, BudgetRange.FROM_2L_TO_5L,
                Timeline.FROM_1_TO_3_MONTHS, PreferredContactMethod.PHONE, "WEBSITE", "/start-project",
                "hashed-ip", "JUnit-Agent", null, null, null, null);
    }

    @Test
    void noEligibleRowReturnsFalseAndNeverTouchesGatewayOrEnquiryLookup() {
        when(outboxRepository.claimNext(any())).thenReturn(Optional.empty());

        assertFalse(processor.claimAndProcessOne());

        verify(mailGateway, never()).send(any());
        verify(projectEnquiryRepository, never()).findById(any());
    }

    @Test
    void successfulSendMarksSentAndPopulatesSentAt() {
        NotificationOutbox outbox = new NotificationOutbox(UUID.randomUUID(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT);
        ProjectEnquiry enquiry = sampleEnquiry();
        when(outboxRepository.claimNext(any())).thenReturn(Optional.of(outbox));
        when(projectEnquiryRepository.findById(outbox.getProjectEnquiryId())).thenReturn(Optional.of(enquiry));
        MailMessage message = new MailMessage(List.of("arun@example.com"), "no-reply@arooraa.com", "AROORAA", null, "s", "h", "t");
        when(leadNotificationService.buildMessage(outbox, enquiry)).thenReturn(message);

        assertTrue(processor.claimAndProcessOne());

        verify(mailGateway).send(message);
        assertEquals(NotificationOutboxStatus.SENT, outbox.getStatus());
        assertNotNull(outbox.getSentAt());
        assertEquals(1, outbox.getAttemptCount());
        verify(outboxRepository).save(outbox);
    }

    @Test
    void retryableFailureBelowMaxAttemptsSchedulesRetryWithFirstBackoffDelay() {
        NotificationOutbox outbox = new NotificationOutbox(UUID.randomUUID(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT);
        ProjectEnquiry enquiry = sampleEnquiry();
        when(outboxRepository.claimNext(any())).thenReturn(Optional.of(outbox));
        when(projectEnquiryRepository.findById(outbox.getProjectEnquiryId())).thenReturn(Optional.of(enquiry));
        when(leadNotificationService.buildMessage(outbox, enquiry))
                .thenReturn(new MailMessage(List.of("a@example.com"), "f@arooraa.com", "AROORAA", null, "s", "h", "t"));
        doThrow(new RetryableMailDeliveryException("SMTP_TIMEOUT", "timed out", null)).when(mailGateway).send(any());

        Instant before = Instant.now();
        processor.claimAndProcessOne();

        assertEquals(NotificationOutboxStatus.RETRY, outbox.getStatus());
        assertEquals(1, outbox.getAttemptCount());
        assertEquals("SMTP_TIMEOUT", outbox.getLastErrorCode());
        // First attempt's backoff is +1 minute (W3.2C §16).
        assertTrue(outbox.getNextAttemptAt().isAfter(before.plusSeconds(50)));
        assertTrue(outbox.getNextAttemptAt().isBefore(before.plusSeconds(70)));
    }

    @Test
    void retryableFailureAtFifthAttemptMarksFailedInsteadOfSchedulingAnotherRetry() {
        NotificationOutbox outbox = new NotificationOutbox(UUID.randomUUID(), NotificationType.INTERNAL_SALES_ALERT);
        // Simulate four prior failed attempts.
        outbox.markProcessing();
        outbox.markProcessing();
        outbox.markProcessing();
        outbox.markProcessing();
        assertEquals(4, outbox.getAttemptCount());

        ProjectEnquiry enquiry = sampleEnquiry();
        when(outboxRepository.claimNext(any())).thenReturn(Optional.of(outbox));
        when(projectEnquiryRepository.findById(outbox.getProjectEnquiryId())).thenReturn(Optional.of(enquiry));
        when(leadNotificationService.buildMessage(outbox, enquiry))
                .thenReturn(new MailMessage(List.of("a@example.com"), "f@arooraa.com", "AROORAA", null, "s", "h", "t"));
        doThrow(new RetryableMailDeliveryException("SMTP_TIMEOUT", "timed out", null)).when(mailGateway).send(any());

        processor.claimAndProcessOne();

        assertEquals(5, outbox.getAttemptCount());
        assertEquals(NotificationOutboxStatus.FAILED, outbox.getStatus());
    }

    @Test
    void permanentFailureMarksFailedImmediatelyOnFirstAttempt() {
        NotificationOutbox outbox = new NotificationOutbox(UUID.randomUUID(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT);
        ProjectEnquiry enquiry = sampleEnquiry();
        when(outboxRepository.claimNext(any())).thenReturn(Optional.of(outbox));
        when(projectEnquiryRepository.findById(outbox.getProjectEnquiryId())).thenReturn(Optional.of(enquiry));
        when(leadNotificationService.buildMessage(outbox, enquiry))
                .thenReturn(new MailMessage(List.of("a@example.com"), "f@arooraa.com", "AROORAA", null, "s", "h", "t"));
        doThrow(new PermanentMailDeliveryException("SMTP_INVALID_ADDRESS", "bad address", null))
                .when(mailGateway).send(any());

        processor.claimAndProcessOne();

        assertEquals(NotificationOutboxStatus.FAILED, outbox.getStatus());
        assertEquals(1, outbox.getAttemptCount());
        assertEquals("SMTP_INVALID_ADDRESS", outbox.getLastErrorCode());
    }

    @Test
    void unexpectedRuntimeExceptionIsTreatedAsRetryableNotFailed() {
        NotificationOutbox outbox = new NotificationOutbox(UUID.randomUUID(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT);
        ProjectEnquiry enquiry = sampleEnquiry();
        when(outboxRepository.claimNext(any())).thenReturn(Optional.of(outbox));
        when(projectEnquiryRepository.findById(outbox.getProjectEnquiryId())).thenReturn(Optional.of(enquiry));
        when(leadNotificationService.buildMessage(outbox, enquiry)).thenThrow(new IllegalStateException("boom"));

        processor.claimAndProcessOne();

        assertEquals(NotificationOutboxStatus.RETRY, outbox.getStatus());
        assertEquals("UNKNOWN_ERROR", outbox.getLastErrorCode());
    }

    @Test
    void missingReferencedEnquiryMarksFailedWithoutCallingGateway() {
        NotificationOutbox outbox = new NotificationOutbox(UUID.randomUUID(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT);
        when(outboxRepository.claimNext(any())).thenReturn(Optional.of(outbox));
        when(projectEnquiryRepository.findById(outbox.getProjectEnquiryId())).thenReturn(Optional.empty());

        processor.claimAndProcessOne();

        assertEquals(NotificationOutboxStatus.FAILED, outbox.getStatus());
        assertEquals("ENQUIRY_NOT_FOUND", outbox.getLastErrorCode());
        verify(mailGateway, never()).send(any());
    }
}
