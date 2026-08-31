package com.arooraa.leads.contact.notification.service;

import com.arooraa.leads.contact.domain.ContactMessage;
import com.arooraa.leads.contact.notification.domain.ContactNotificationOutbox;
import com.arooraa.leads.contact.notification.repository.ContactNotificationOutboxRepository;
import com.arooraa.leads.contact.repository.ContactMessageRepository;
import com.arooraa.leads.project.notification.mail.MailDeliveryException;
import com.arooraa.leads.project.notification.mail.MailGateway;
import com.arooraa.leads.project.notification.mail.MailMessage;
import com.arooraa.leads.project.notification.mail.PermanentMailDeliveryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/** The claim -> send -> finalize sequence for exactly one Contact outbox row — a structural twin of NotificationOutboxProcessor/RecruitmentNotificationOutboxProcessor; see either for the full self-invocation reasoning. */
@Component
@ConditionalOnProperty(prefix = "arooraa.contact-notifications", name = "enabled", havingValue = "true")
public class ContactNotificationOutboxProcessor {

    private static final Logger log = LoggerFactory.getLogger(ContactNotificationOutboxProcessor.class);

    private static final int MAX_ATTEMPTS = 5;
    private static final List<Duration> RETRY_DELAYS = List.of(
            Duration.ofMinutes(1), Duration.ofMinutes(5), Duration.ofMinutes(15), Duration.ofHours(1));

    private final ContactNotificationOutboxRepository outboxRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final ContactNotificationService notificationService;
    private final MailGateway mailGateway;

    public ContactNotificationOutboxProcessor(ContactNotificationOutboxRepository outboxRepository,
                                                ContactMessageRepository contactMessageRepository,
                                                ContactNotificationService notificationService,
                                                MailGateway mailGateway) {
        this.outboxRepository = outboxRepository;
        this.contactMessageRepository = contactMessageRepository;
        this.notificationService = notificationService;
        this.mailGateway = mailGateway;
    }

    @Transactional
    public boolean claimAndProcessOne() {
        Optional<ContactNotificationOutbox> claimed = outboxRepository.claimNext(Instant.now());
        if (claimed.isEmpty()) {
            return false;
        }
        ContactNotificationOutbox outbox = claimed.get();
        outbox.markProcessing();

        Optional<ContactMessage> message = contactMessageRepository.findById(outbox.getContactMessageId());
        if (message.isEmpty()) {
            outbox.markFailed("MESSAGE_NOT_FOUND", "Referenced contact message no longer exists.");
            log.warn("contact-notification failed messageId={} type={} status={} error=MESSAGE_NOT_FOUND",
                    outbox.getContactMessageId(), outbox.getNotificationType(), outbox.getStatus());
            outboxRepository.save(outbox);
            return true;
        }

        try {
            MailMessage mailMessage = notificationService.buildMessage(outbox, message.get());
            mailGateway.send(mailMessage);
            outbox.markSent();
            log.info("contact-notification sent reference={} type={} attempt={}",
                    message.get().getContactReference(), outbox.getNotificationType(), outbox.getAttemptCount());
        } catch (PermanentMailDeliveryException e) {
            outbox.markFailed(e.errorCode(), safeSummary(e));
            logFailure(outbox, message.get(), e);
        } catch (MailDeliveryException e) {
            applyRetryOrFail(outbox, e.errorCode(), safeSummary(e));
            logFailure(outbox, message.get(), e);
        } catch (RuntimeException e) {
            applyRetryOrFail(outbox, "UNKNOWN_ERROR", safeSummary(e));
            logFailure(outbox, message.get(), e);
        }

        outboxRepository.save(outbox);
        return true;
    }

    private void applyRetryOrFail(ContactNotificationOutbox outbox, String errorCode, String errorSummary) {
        if (outbox.getAttemptCount() >= MAX_ATTEMPTS) {
            outbox.markFailed(errorCode, errorSummary);
        } else {
            outbox.markRetry(RETRY_DELAYS.get(outbox.getAttemptCount() - 1), errorCode, errorSummary);
        }
    }

    /** No email addresses, phone numbers, message content, or SMTP credentials in logs (W3.4 §14). */
    private void logFailure(ContactNotificationOutbox outbox, ContactMessage message, Exception e) {
        log.warn("contact-notification failed reference={} type={} attempt={} status={} error={}",
                message.getContactReference(), outbox.getNotificationType(), outbox.getAttemptCount(),
                outbox.getStatus(), e instanceof MailDeliveryException mde ? mde.errorCode() : "UNKNOWN_ERROR");
    }

    private static String safeSummary(Exception e) {
        String message = e.getMessage();
        if (message == null || message.isBlank()) {
            return e.getClass().getSimpleName();
        }
        return message.length() > 300 ? message.substring(0, 300) : message;
    }
}
