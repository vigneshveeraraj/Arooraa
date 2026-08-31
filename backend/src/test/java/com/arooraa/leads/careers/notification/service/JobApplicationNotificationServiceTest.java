package com.arooraa.leads.careers.notification.service;

import com.arooraa.leads.careers.domain.JobApplication;
import com.arooraa.leads.careers.notification.config.RecruitmentNotificationProperties;
import com.arooraa.leads.careers.notification.domain.RecruitmentNotificationOutbox;
import com.arooraa.leads.careers.notification.domain.RecruitmentNotificationType;
import com.arooraa.leads.careers.notification.repository.RecruitmentNotificationOutboxRepository;
import com.arooraa.leads.project.notification.mail.MailMessage;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.Mockito.mock;

/**
 * W4.7 — proves the RFC 5322 From identity AROORAA presents to Gmail/other inboxes for Careers
 * mail specifically: "AROORAA Careers", never the bare mailbox and never the candidate's own
 * address. Pure unit coverage of {@link JobApplicationNotificationService#buildMessage}.
 */
class JobApplicationNotificationServiceTest {

    private static final String CANDIDATE_EMAIL = "priya@example.com";

    private final RecruitmentNotificationProperties properties = new RecruitmentNotificationProperties(
            true, "hello@arooraa.com", "AROORAA Careers", List.of("careers@arooraa.com"),
            new RecruitmentNotificationProperties.Worker(10, 20));

    private final JobApplicationNotificationService service =
            new JobApplicationNotificationService(mock(RecruitmentNotificationOutboxRepository.class), properties);

    private static JobApplication sampleApplication() {
        JobApplication application = new JobApplication("JOB-2026-000001", "ai-engineer", "AI Engineer", "Priya Sharma",
                CANDIDATE_EMAIL, "+919876543210", null, null, null, null, null, true, "hashed-ip");
        // Internal-alert view rendering formats createdAt, which @PrePersist only sets on a real
        // JPA persist — this entity is never persisted here, so it needs a value directly.
        ReflectionTestUtils.setField(application, "createdAt", Instant.now());
        return application;
    }

    @Test
    void candidateAcknowledgementShowsAroraaCareersNotTheBareMailbox() {
        JobApplication application = sampleApplication();
        RecruitmentNotificationOutbox outbox =
                new RecruitmentNotificationOutbox(application.getId(), RecruitmentNotificationType.CANDIDATE_ACKNOWLEDGEMENT);

        MailMessage message = service.buildMessage(outbox, application);

        assertEquals("AROORAA Careers", message.fromDisplayName());
        assertEquals("hello@arooraa.com", message.from());
    }

    @Test
    void internalRecruitmentAlertAlsoShowsAroraaCareers() {
        JobApplication application = sampleApplication();
        RecruitmentNotificationOutbox outbox =
                new RecruitmentNotificationOutbox(application.getId(), RecruitmentNotificationType.INTERNAL_RECRUITMENT_ALERT);

        MailMessage message = service.buildMessage(outbox, application);

        assertEquals("AROORAA Careers", message.fromDisplayName());
        assertEquals("hello@arooraa.com", message.from());
    }

    @Test
    void candidateEmailIsNeverUsedAsFrom() {
        JobApplication application = sampleApplication();
        RecruitmentNotificationOutbox ack =
                new RecruitmentNotificationOutbox(application.getId(), RecruitmentNotificationType.CANDIDATE_ACKNOWLEDGEMENT);
        RecruitmentNotificationOutbox alert =
                new RecruitmentNotificationOutbox(application.getId(), RecruitmentNotificationType.INTERNAL_RECRUITMENT_ALERT);

        assertNotEquals(CANDIDATE_EMAIL, service.buildMessage(ack, application).from());
        assertNotEquals(CANDIDATE_EMAIL, service.buildMessage(alert, application).from());
    }
}
