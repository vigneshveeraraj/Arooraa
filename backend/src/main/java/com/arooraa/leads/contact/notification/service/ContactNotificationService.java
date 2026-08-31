package com.arooraa.leads.contact.notification.service;

import com.arooraa.leads.contact.domain.ContactMessage;
import com.arooraa.leads.contact.notification.config.ContactNotificationProperties;
import com.arooraa.leads.contact.notification.domain.ContactNotificationOutbox;
import com.arooraa.leads.contact.notification.domain.ContactNotificationType;
import com.arooraa.leads.contact.notification.repository.ContactNotificationOutboxRepository;
import com.arooraa.leads.contact.notification.template.CustomerAcknowledgementTemplate;
import com.arooraa.leads.contact.notification.template.CustomerAcknowledgementView;
import com.arooraa.leads.contact.notification.template.InternalContactAlertTemplate;
import com.arooraa.leads.contact.notification.template.InternalContactAlertView;
import com.arooraa.leads.project.notification.mail.MailMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Mirrors {@code LeadNotificationService}/{@code JobApplicationNotificationService}: (1) create
 * durable outbox intents inside the same transaction as the message insert, (2) build the
 * {@link MailMessage} for a claimed outbox row. Holds no {@code MailGateway} dependency —
 * {@link #createIntents} runs unconditionally regardless of whether sending is enabled (W3.4
 * §13: disabled mode must still persist).
 */
@Service
public class ContactNotificationService {

    private static final int MESSAGE_PREVIEW_MAX_CHARS = 400;
    private static final DateTimeFormatter RECEIVED_AT_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm 'UTC'").withZone(ZoneOffset.UTC);

    private final ContactNotificationOutboxRepository outboxRepository;
    private final ContactNotificationProperties properties;

    public ContactNotificationService(ContactNotificationOutboxRepository outboxRepository, ContactNotificationProperties properties) {
        this.outboxRepository = outboxRepository;
        this.properties = properties;
    }

    @Transactional
    public void createIntents(ContactMessage message) {
        outboxRepository.save(new ContactNotificationOutbox(message.getId(), ContactNotificationType.CUSTOMER_ACKNOWLEDGEMENT));
        outboxRepository.save(new ContactNotificationOutbox(message.getId(), ContactNotificationType.INTERNAL_CONTACT_ALERT));
    }

    public MailMessage buildMessage(ContactNotificationOutbox outbox, ContactMessage message) {
        return switch (outbox.getNotificationType()) {
            case CUSTOMER_ACKNOWLEDGEMENT -> buildCustomerAcknowledgement(message);
            case INTERNAL_CONTACT_ALERT -> buildInternalContactAlert(message);
        };
    }

    private MailMessage buildCustomerAcknowledgement(ContactMessage message) {
        CustomerAcknowledgementView view = new CustomerAcknowledgementView(
                message.getContactReference(), message.getName(), EnumHumanizer.humanize(message.getReason()));
        return new MailMessage(
                List.of(message.getEmail()), properties.mailFrom(), properties.mailFromDisplayName(), null,
                CustomerAcknowledgementTemplate.subject(view),
                CustomerAcknowledgementTemplate.renderHtml(view),
                CustomerAcknowledgementTemplate.renderText(view));
    }

    private MailMessage buildInternalContactAlert(ContactMessage message) {
        InternalContactAlertView view = new InternalContactAlertView(
                message.getContactReference(),
                RECEIVED_AT_FORMAT.format(message.getCreatedAt()),
                EnumHumanizer.humanize(message.getReason()),
                EnumHumanizer.humanize(message.getProduct()),
                message.getName(), message.getEmail(), message.getPhone(), message.getCompany(),
                truncate(message.getMessage()));
        return new MailMessage(
                properties.contactAlertTo(), properties.mailFrom(), properties.mailFromDisplayName(), null,
                InternalContactAlertTemplate.subject(view),
                InternalContactAlertTemplate.renderHtml(view),
                InternalContactAlertTemplate.renderText(view));
    }

    private static String truncate(String text) {
        if (text == null) {
            return null;
        }
        String trimmed = text.trim();
        if (trimmed.length() <= MESSAGE_PREVIEW_MAX_CHARS) {
            return trimmed.isEmpty() ? null : trimmed;
        }
        return trimmed.substring(0, MESSAGE_PREVIEW_MAX_CHARS).trim() + "…";
    }
}
