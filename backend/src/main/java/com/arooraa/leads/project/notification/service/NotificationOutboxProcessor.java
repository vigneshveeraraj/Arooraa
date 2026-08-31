package com.arooraa.leads.project.notification.service;

import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.notification.domain.NotificationOutbox;
import com.arooraa.leads.project.notification.mail.MailDeliveryException;
import com.arooraa.leads.project.notification.mail.MailGateway;
import com.arooraa.leads.project.notification.mail.MailMessage;
import com.arooraa.leads.project.notification.mail.PermanentMailDeliveryException;
import com.arooraa.leads.project.notification.repository.NotificationOutboxRepository;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * The claim -> send -> finalize sequence for exactly one outbox row (W3.2C §13-17), kept in its
 * own bean — separate from {@link NotificationOutboxWorker}'s {@code @Scheduled} loop —
 * specifically so {@link #claimAndProcessOne()} is invoked as a genuine cross-bean call. Spring's
 * {@code @Transactional} is proxy-based: a same-class self-invocation (the loop calling its own
 * {@code @Transactional} method) silently skips the proxy and runs with no transaction at all,
 * which would break the claim's row lock and the retry/finalize atomicity this depends on.
 * Splitting the loop from the transactional unit avoids that trap entirely rather than relying on
 * self-injection tricks.
 */
@Component
@ConditionalOnProperty(prefix = "arooraa.lead-notifications", name = "enabled", havingValue = "true")
public class NotificationOutboxProcessor {

    private static final Logger log = LoggerFactory.getLogger(NotificationOutboxProcessor.class);

    private static final int MAX_ATTEMPTS = 5;
    private static final List<Duration> RETRY_DELAYS = List.of(
            Duration.ofMinutes(1), Duration.ofMinutes(5), Duration.ofMinutes(15), Duration.ofHours(1));

    private final NotificationOutboxRepository outboxRepository;
    private final ProjectEnquiryRepository projectEnquiryRepository;
    private final LeadNotificationService leadNotificationService;
    private final MailGateway mailGateway;

    public NotificationOutboxProcessor(NotificationOutboxRepository outboxRepository,
                                        ProjectEnquiryRepository projectEnquiryRepository,
                                        LeadNotificationService leadNotificationService,
                                        MailGateway mailGateway) {
        this.outboxRepository = outboxRepository;
        this.projectEnquiryRepository = projectEnquiryRepository;
        this.leadNotificationService = leadNotificationService;
        this.mailGateway = mailGateway;
    }

    /**
     * Claims (via {@code FOR UPDATE SKIP LOCKED}), sends, and finalizes at most one row, all in
     * one transaction — see the class Javadoc and NotificationOutboxRepository#claimNext for why
     * that single transaction is itself the crash-recovery mechanism (W3.2C §36).
     *
     * @return true if a row was claimed (regardless of send outcome), false if none was eligible.
     */
    @Transactional
    public boolean claimAndProcessOne() {
        Optional<NotificationOutbox> claimed = outboxRepository.claimNext(Instant.now());
        if (claimed.isEmpty()) {
            return false;
        }
        NotificationOutbox outbox = claimed.get();
        outbox.markProcessing();

        Optional<ProjectEnquiry> enquiry = projectEnquiryRepository.findById(outbox.getProjectEnquiryId());
        if (enquiry.isEmpty()) {
            // Referential data problem, not a transient send failure — retrying won't help.
            outbox.markFailed("ENQUIRY_NOT_FOUND", "Referenced project enquiry no longer exists.");
            logOutcome(outbox, "ENQUIRY_NOT_FOUND");
            outboxRepository.save(outbox);
            return true;
        }

        try {
            MailMessage message = leadNotificationService.buildMessage(outbox, enquiry.get());
            mailGateway.send(message);
            outbox.markSent();
            log.info("lead-notification sent reference={} type={} attempt={}",
                    enquiry.get().getEnquiryNumber(), outbox.getNotificationType(), outbox.getAttemptCount());
        } catch (PermanentMailDeliveryException e) {
            outbox.markFailed(e.errorCode(), safeSummary(e));
            logFailure(outbox, enquiry.get(), e);
        } catch (MailDeliveryException e) {
            applyRetryOrFail(outbox, e.errorCode(), safeSummary(e));
            logFailure(outbox, enquiry.get(), e);
        } catch (RuntimeException e) {
            applyRetryOrFail(outbox, "UNKNOWN_ERROR", safeSummary(e));
            logFailure(outbox, enquiry.get(), e);
        }

        outboxRepository.save(outbox);
        return true;
    }

    private void applyRetryOrFail(NotificationOutbox outbox, String errorCode, String errorSummary) {
        if (outbox.getAttemptCount() >= MAX_ATTEMPTS) {
            outbox.markFailed(errorCode, errorSummary);
        } else {
            outbox.markRetry(RETRY_DELAYS.get(outbox.getAttemptCount() - 1), errorCode, errorSummary);
        }
    }

    /** No email addresses, phone numbers, problem text, or SMTP credentials in logs (W3.2C §18). */
    private void logFailure(NotificationOutbox outbox, ProjectEnquiry enquiry, Exception e) {
        log.warn("lead-notification failed reference={} type={} attempt={} status={} error={}",
                enquiry.getEnquiryNumber(), outbox.getNotificationType(), outbox.getAttemptCount(),
                outbox.getStatus(), e instanceof MailDeliveryException mde ? mde.errorCode() : "UNKNOWN_ERROR");
    }

    private void logOutcome(NotificationOutbox outbox, String errorCode) {
        log.warn("lead-notification failed enquiryId={} type={} status={} error={}",
                outbox.getProjectEnquiryId(), outbox.getNotificationType(), outbox.getStatus(), errorCode);
    }

    private static String safeSummary(Exception e) {
        String message = e.getMessage();
        if (message == null || message.isBlank()) {
            return e.getClass().getSimpleName();
        }
        return message.length() > 300 ? message.substring(0, 300) : message;
    }
}
