package com.arooraa.leads.project.notification.service;

import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.Timeline;
import com.arooraa.leads.project.notification.config.LeadNotificationProperties;
import com.arooraa.leads.project.notification.domain.NotificationOutbox;
import com.arooraa.leads.project.notification.domain.NotificationType;
import com.arooraa.leads.project.notification.mail.MailMessage;
import com.arooraa.leads.project.notification.repository.NotificationOutboxRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.Mockito.mock;

/**
 * W4.7 — proves the RFC 5322 From identity AROORAA presents to Gmail/other inboxes: a branded
 * display name alongside the mailbox, never the customer's own address. Pure unit coverage of
 * {@link LeadNotificationService#buildMessage}, no Spring context, no DB.
 */
class LeadNotificationServiceTest {

    private static final String CUSTOMER_EMAIL = "arun@example.com";

    private final LeadNotificationProperties properties = new LeadNotificationProperties(
            true, "hello@arooraa.com", "AROORAA", "hello@arooraa.com",
            java.util.List.of("sales@arooraa.com"), new LeadNotificationProperties.Worker(10, 20));

    private final LeadNotificationService service =
            new LeadNotificationService(mock(NotificationOutboxRepository.class), properties);

    private static ProjectEnquiry sampleEnquiry() {
        ProjectEnquiry enquiry = new ProjectEnquiry(
                "ARO-2026-000001", "Arun Kumar", "ABC Logistics", CUSTOMER_EMAIL, "+919876543210",
                "+919876543210", "India", ServiceType.CUSTOM_SOFTWARE, ProjectType.NEW_PRODUCT,
                "We need a logistics tracking platform.", false, BudgetRange.FROM_2L_TO_5L,
                Timeline.FROM_1_TO_3_MONTHS, PreferredContactMethod.PHONE, "WEBSITE", "/start-project",
                "hashed-ip", "JUnit-Agent", null, null, null, null);
        // Internal-alert view rendering formats createdAt, which @PrePersist only sets on a real
        // JPA persist — this entity is never persisted here, so it needs a value directly.
        ReflectionTestUtils.setField(enquiry, "createdAt", Instant.now());
        return enquiry;
    }

    @Test
    void customerAcknowledgementShowsTheConfiguredAroraaDisplayNameNotTheBareMailbox() {
        ProjectEnquiry enquiry = sampleEnquiry();
        NotificationOutbox outbox = new NotificationOutbox(UUID.randomUUID(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT);

        MailMessage message = service.buildMessage(outbox, enquiry);

        assertEquals("AROORAA", message.fromDisplayName());
        assertEquals("hello@arooraa.com", message.from());
    }

    @Test
    void internalSalesAlertAlsoShowsTheConfiguredAroraaDisplayName() {
        ProjectEnquiry enquiry = sampleEnquiry();
        NotificationOutbox outbox = new NotificationOutbox(UUID.randomUUID(), NotificationType.INTERNAL_SALES_ALERT);

        MailMessage message = service.buildMessage(outbox, enquiry);

        assertEquals("AROORAA", message.fromDisplayName());
        assertEquals("hello@arooraa.com", message.from());
    }

    @Test
    void customerEmailIsNeverUsedAsFrom() {
        ProjectEnquiry enquiry = sampleEnquiry();
        NotificationOutbox ack = new NotificationOutbox(UUID.randomUUID(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT);
        NotificationOutbox alert = new NotificationOutbox(UUID.randomUUID(), NotificationType.INTERNAL_SALES_ALERT);

        assertNotEquals(CUSTOMER_EMAIL, service.buildMessage(ack, enquiry).from());
        assertNotEquals(CUSTOMER_EMAIL, service.buildMessage(alert, enquiry).from());
    }
}
