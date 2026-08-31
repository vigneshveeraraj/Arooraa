package com.arooraa.leads.careers.notification.service;

import com.arooraa.leads.careers.domain.JobApplication;
import com.arooraa.leads.careers.notification.domain.RecruitmentNotificationOutbox;
import com.arooraa.leads.careers.notification.repository.RecruitmentNotificationOutboxRepository;
import com.arooraa.leads.careers.repository.JobApplicationRepository;
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

/**
 * The claim -> send -> finalize sequence for exactly one recruitment outbox row — a structural
 * twin of {@code NotificationOutboxProcessor}, kept as its own bean for the same reason: a
 * same-class self-invocation would silently skip the {@code @Transactional} proxy and break the
 * claim's row lock. See that class's Javadoc for the full reasoning.
 */
@Component
@ConditionalOnProperty(prefix = "arooraa.recruitment-notifications", name = "enabled", havingValue = "true")
public class RecruitmentNotificationOutboxProcessor {

    private static final Logger log = LoggerFactory.getLogger(RecruitmentNotificationOutboxProcessor.class);

    private static final int MAX_ATTEMPTS = 5;
    private static final List<Duration> RETRY_DELAYS = List.of(
            Duration.ofMinutes(1), Duration.ofMinutes(5), Duration.ofMinutes(15), Duration.ofHours(1));

    private final RecruitmentNotificationOutboxRepository outboxRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobApplicationNotificationService notificationService;
    private final MailGateway mailGateway;

    public RecruitmentNotificationOutboxProcessor(RecruitmentNotificationOutboxRepository outboxRepository,
                                                    JobApplicationRepository jobApplicationRepository,
                                                    JobApplicationNotificationService notificationService,
                                                    MailGateway mailGateway) {
        this.outboxRepository = outboxRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.notificationService = notificationService;
        this.mailGateway = mailGateway;
    }

    /** @return true if a row was claimed (regardless of send outcome), false if none was eligible. */
    @Transactional
    public boolean claimAndProcessOne() {
        Optional<RecruitmentNotificationOutbox> claimed = outboxRepository.claimNext(Instant.now());
        if (claimed.isEmpty()) {
            return false;
        }
        RecruitmentNotificationOutbox outbox = claimed.get();
        outbox.markProcessing();

        Optional<JobApplication> application = jobApplicationRepository.findById(outbox.getJobApplicationId());
        if (application.isEmpty()) {
            outbox.markFailed("APPLICATION_NOT_FOUND", "Referenced job application no longer exists.");
            log.warn("recruitment-notification failed applicationId={} type={} status={} error=APPLICATION_NOT_FOUND",
                    outbox.getJobApplicationId(), outbox.getNotificationType(), outbox.getStatus());
            outboxRepository.save(outbox);
            return true;
        }

        try {
            MailMessage message = notificationService.buildMessage(outbox, application.get());
            mailGateway.send(message);
            outbox.markSent();
            log.info("recruitment-notification sent reference={} type={} attempt={}",
                    application.get().getApplicationReference(), outbox.getNotificationType(), outbox.getAttemptCount());
        } catch (PermanentMailDeliveryException e) {
            outbox.markFailed(e.errorCode(), safeSummary(e));
            logFailure(outbox, application.get(), e);
        } catch (MailDeliveryException e) {
            applyRetryOrFail(outbox, e.errorCode(), safeSummary(e));
            logFailure(outbox, application.get(), e);
        } catch (RuntimeException e) {
            applyRetryOrFail(outbox, "UNKNOWN_ERROR", safeSummary(e));
            logFailure(outbox, application.get(), e);
        }

        outboxRepository.save(outbox);
        return true;
    }

    private void applyRetryOrFail(RecruitmentNotificationOutbox outbox, String errorCode, String errorSummary) {
        if (outbox.getAttemptCount() >= MAX_ATTEMPTS) {
            outbox.markFailed(errorCode, errorSummary);
        } else {
            outbox.markRetry(RETRY_DELAYS.get(outbox.getAttemptCount() - 1), errorCode, errorSummary);
        }
    }

    /** No email addresses, phone numbers, résumé content, or SMTP credentials in logs (W3.3B §13). */
    private void logFailure(RecruitmentNotificationOutbox outbox, JobApplication application, Exception e) {
        log.warn("recruitment-notification failed reference={} type={} attempt={} status={} error={}",
                application.getApplicationReference(), outbox.getNotificationType(), outbox.getAttemptCount(),
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
