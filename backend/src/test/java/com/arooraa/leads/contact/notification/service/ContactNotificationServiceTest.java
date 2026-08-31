package com.arooraa.leads.contact.notification.service;

import com.arooraa.leads.contact.domain.ContactMessage;
import com.arooraa.leads.contact.domain.ContactReason;
import com.arooraa.leads.contact.notification.config.ContactNotificationProperties;
import com.arooraa.leads.contact.notification.domain.ContactNotificationOutbox;
import com.arooraa.leads.contact.notification.domain.ContactNotificationType;
import com.arooraa.leads.contact.notification.repository.ContactNotificationOutboxRepository;
import com.arooraa.leads.project.notification.mail.MailMessage;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.Mockito.mock;

/**
 * W4.7 — proves the RFC 5322 From identity AROORAA presents to Gmail/other inboxes for Contact
 * mail specifically: "AROORAA", never the bare mailbox and never the sender's own address. Pure
 * unit coverage of {@link ContactNotificationService#buildMessage}.
 */
class ContactNotificationServiceTest {

    private static final String SENDER_EMAIL = "priya@example.com";

    private final ContactNotificationProperties properties = new ContactNotificationProperties(
            true, "hello@arooraa.com", "AROORAA", List.of("contact@arooraa.com"),
            new ContactNotificationProperties.Worker(10, 20));

    private final ContactNotificationService service =
            new ContactNotificationService(mock(ContactNotificationOutboxRepository.class), properties);

    private static ContactMessage sampleMessage() {
        ContactMessage message = new ContactMessage("CNT-2026-000001", "Priya Sharma", SENDER_EMAIL,
                "+919876543210", "Acme Co", ContactReason.PARTNERSHIP, null,
                "We'd like to explore a potential partnership with AROORAA.", "hashed-ip");
        // Internal-alert view rendering formats createdAt, which @PrePersist only sets on a real
        // JPA persist — this entity is never persisted here, so it needs a value directly.
        ReflectionTestUtils.setField(message, "createdAt", Instant.now());
        return message;
    }

    @Test
    void customerAcknowledgementShowsTheConfiguredAroraaDisplayNameNotTheBareMailbox() {
        ContactMessage message = sampleMessage();
        ContactNotificationOutbox outbox =
                new ContactNotificationOutbox(message.getId(), ContactNotificationType.CUSTOMER_ACKNOWLEDGEMENT);

        MailMessage mail = service.buildMessage(outbox, message);

        assertEquals("AROORAA", mail.fromDisplayName());
        assertEquals("hello@arooraa.com", mail.from());
    }

    @Test
    void internalContactAlertAlsoShowsTheConfiguredAroraaDisplayName() {
        ContactMessage message = sampleMessage();
        ContactNotificationOutbox outbox =
                new ContactNotificationOutbox(message.getId(), ContactNotificationType.INTERNAL_CONTACT_ALERT);

        MailMessage mail = service.buildMessage(outbox, message);

        assertEquals("AROORAA", mail.fromDisplayName());
        assertEquals("hello@arooraa.com", mail.from());
    }

    @Test
    void senderEmailIsNeverUsedAsFrom() {
        ContactMessage message = sampleMessage();
        ContactNotificationOutbox ack =
                new ContactNotificationOutbox(message.getId(), ContactNotificationType.CUSTOMER_ACKNOWLEDGEMENT);
        ContactNotificationOutbox alert =
                new ContactNotificationOutbox(message.getId(), ContactNotificationType.INTERNAL_CONTACT_ALERT);

        assertNotEquals(SENDER_EMAIL, service.buildMessage(ack, message).from());
        assertNotEquals(SENDER_EMAIL, service.buildMessage(alert, message).from());
    }
}
