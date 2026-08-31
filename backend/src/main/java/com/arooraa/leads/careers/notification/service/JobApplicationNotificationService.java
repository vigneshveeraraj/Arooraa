package com.arooraa.leads.careers.notification.service;

import com.arooraa.leads.careers.domain.JobApplication;
import com.arooraa.leads.careers.notification.config.RecruitmentNotificationProperties;
import com.arooraa.leads.careers.notification.domain.RecruitmentNotificationOutbox;
import com.arooraa.leads.careers.notification.domain.RecruitmentNotificationType;
import com.arooraa.leads.careers.notification.repository.RecruitmentNotificationOutboxRepository;
import com.arooraa.leads.careers.notification.template.CandidateAcknowledgementTemplate;
import com.arooraa.leads.careers.notification.template.CandidateAcknowledgementView;
import com.arooraa.leads.careers.notification.template.InternalRecruitmentAlertTemplate;
import com.arooraa.leads.careers.notification.template.InternalRecruitmentAlertView;
import com.arooraa.leads.project.notification.mail.MailMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Mirrors {@code LeadNotificationService}'s two responsibilities exactly: (1) create durable
 * outbox intents inside the same transaction as the application insert (W3.3B §14 — "AFTER/
 * DURING the durable application transaction"), and (2) build the actual {@link MailMessage}
 * for a claimed outbox row. Holds no dependency on {@code MailGateway} — {@link #createIntents}
 * runs unconditionally for every new application regardless of whether sending is enabled
 * (§14's "application MUST still persist successfully" even with SMTP disabled), so this must
 * be constructible with no mail infrastructure present at all.
 */
@Service
public class JobApplicationNotificationService {

    private static final DateTimeFormatter RECEIVED_AT_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm 'UTC'").withZone(ZoneOffset.UTC);

    private final RecruitmentNotificationOutboxRepository outboxRepository;
    private final RecruitmentNotificationProperties properties;

    public JobApplicationNotificationService(RecruitmentNotificationOutboxRepository outboxRepository,
                                              RecruitmentNotificationProperties properties) {
        this.outboxRepository = outboxRepository;
        this.properties = properties;
    }

    /** Called once per newly-created application — never for an idempotency replay (that path returns before ever reaching this call). */
    @Transactional
    public void createIntents(JobApplication application) {
        outboxRepository.save(new RecruitmentNotificationOutbox(application.getId(), RecruitmentNotificationType.CANDIDATE_ACKNOWLEDGEMENT));
        outboxRepository.save(new RecruitmentNotificationOutbox(application.getId(), RecruitmentNotificationType.INTERNAL_RECRUITMENT_ALERT));
    }

    /** Pure — no I/O, no gateway call. The worker sends what this returns. */
    public MailMessage buildMessage(RecruitmentNotificationOutbox outbox, JobApplication application) {
        return switch (outbox.getNotificationType()) {
            case CANDIDATE_ACKNOWLEDGEMENT -> buildCandidateAcknowledgement(application);
            case INTERNAL_RECRUITMENT_ALERT -> buildInternalRecruitmentAlert(application);
        };
    }

    private MailMessage buildCandidateAcknowledgement(JobApplication application) {
        CandidateAcknowledgementView view = new CandidateAcknowledgementView(
                application.getApplicationReference(), application.getCandidateName(), application.getJobTitleSnapshot());
        return new MailMessage(
                List.of(application.getEmail()),
                properties.mailFrom(),
                null,
                CandidateAcknowledgementTemplate.subject(view),
                CandidateAcknowledgementTemplate.renderHtml(view),
                CandidateAcknowledgementTemplate.renderText(view));
    }

    private MailMessage buildInternalRecruitmentAlert(JobApplication application) {
        InternalRecruitmentAlertView view = new InternalRecruitmentAlertView(
                application.getApplicationReference(),
                RECEIVED_AT_FORMAT.format(application.getCreatedAt()),
                application.getJobTitleSnapshot(),
                application.getCandidateName(),
                application.getEmail(),
                application.getPhone(),
                application.getCurrentLocation(),
                application.getExperience(),
                application.getLinkedinUrl(),
                application.getPortfolioUrl(),
                application.getNote(),
                application.getResumeStorageKey() != null);
        return new MailMessage(
                properties.recruitmentAlertTo(),
                properties.mailFrom(),
                null,
                InternalRecruitmentAlertTemplate.subject(view),
                InternalRecruitmentAlertTemplate.renderHtml(view),
                InternalRecruitmentAlertTemplate.renderText(view));
    }
}
