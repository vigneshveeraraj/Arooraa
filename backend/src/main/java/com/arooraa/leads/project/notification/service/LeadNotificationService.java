package com.arooraa.leads.project.notification.service;

import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.notification.config.LeadNotificationProperties;
import com.arooraa.leads.project.notification.domain.NotificationOutbox;
import com.arooraa.leads.project.notification.domain.NotificationType;
import com.arooraa.leads.project.notification.mail.MailMessage;
import com.arooraa.leads.project.notification.repository.NotificationOutboxRepository;
import com.arooraa.leads.project.notification.template.CustomerAcknowledgementTemplate;
import com.arooraa.leads.project.notification.template.CustomerAcknowledgementView;
import com.arooraa.leads.project.notification.template.InternalSalesAlertTemplate;
import com.arooraa.leads.project.notification.template.InternalSalesAlertView;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * The two things W3.2C's diagram calls out for this service: (1) create the durable outbox
 * intents inside the same transaction as the enquiry insert (W3.2C §10), and (2) build the
 * actual {@link MailMessage} for a claimed outbox row (view mapping + template rendering).
 *
 * <p>Deliberately holds no dependency on {@link com.arooraa.leads.project.notification.mail.MailGateway}
 * — {@link #createIntents} is called unconditionally from ProjectEnquiryService for every new
 * enquiry regardless of whether notification sending is enabled (W3.2C §47: disabled mode must
 * still accept leads), so this service must be constructible with no mail infrastructure
 * present at all. Only {@link com.arooraa.leads.project.notification.service.NotificationOutboxWorker}
 * — which exists only when {@code arooraa.lead-notifications.enabled=true} — actually calls the
 * gateway, using the message this class builds.
 */
@Service
public class LeadNotificationService {

    private final NotificationOutboxRepository outboxRepository;
    private final LeadNotificationProperties properties;

    public LeadNotificationService(NotificationOutboxRepository outboxRepository, LeadNotificationProperties properties) {
        this.outboxRepository = outboxRepository;
        this.properties = properties;
    }

    /**
     * Called once per newly-created enquiry (never for an idempotency replay or a
     * legacy-duplicate-heuristic hit — those paths return early in ProjectEnquiryService before
     * ever reaching this call, which is what keeps this naturally exactly-once per enquiry;
     * W3.2C §11, §33). Joins the caller's existing transaction (REQUIRED propagation), so a
     * rollback of the enquiry insert rolls these rows back too — no orphaned outbox rows.
     */
    @Transactional
    public void createIntents(ProjectEnquiry enquiry) {
        outboxRepository.save(new NotificationOutbox(enquiry.getId(), NotificationType.CUSTOMER_ACKNOWLEDGEMENT));
        outboxRepository.save(new NotificationOutbox(enquiry.getId(), NotificationType.INTERNAL_SALES_ALERT));
    }

    /** Pure — no I/O, no gateway call. The worker sends what this returns. */
    public MailMessage buildMessage(NotificationOutbox outbox, ProjectEnquiry enquiry) {
        return switch (outbox.getNotificationType()) {
            case CUSTOMER_ACKNOWLEDGEMENT -> buildCustomerAcknowledgement(enquiry);
            case INTERNAL_SALES_ALERT -> buildInternalSalesAlert(enquiry);
        };
    }

    private MailMessage buildCustomerAcknowledgement(ProjectEnquiry enquiry) {
        CustomerAcknowledgementView view = NotificationViewMapper.toCustomerAcknowledgementView(enquiry);
        return new MailMessage(
                List.of(enquiry.getBusinessEmail()),
                properties.mailFrom(),
                properties.mailFromDisplayName(),
                properties.mailReplyTo(),
                CustomerAcknowledgementTemplate.subject(view),
                CustomerAcknowledgementTemplate.renderHtml(view),
                CustomerAcknowledgementTemplate.renderText(view));
    }

    private MailMessage buildInternalSalesAlert(ProjectEnquiry enquiry) {
        InternalSalesAlertView view = NotificationViewMapper.toInternalSalesAlertView(enquiry);
        return new MailMessage(
                properties.salesNotificationTo(),
                properties.mailFrom(),
                properties.mailFromDisplayName(),
                null,
                InternalSalesAlertTemplate.subject(view),
                InternalSalesAlertTemplate.renderHtml(view),
                InternalSalesAlertTemplate.renderText(view));
    }
}
