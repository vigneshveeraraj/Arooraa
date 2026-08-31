package com.arooraa.leads.careers.service;

import com.arooraa.leads.careers.domain.JobApplication;
import com.arooraa.leads.careers.notification.service.JobApplicationNotificationService;
import com.arooraa.leads.careers.registry.RecruitmentJob;
import com.arooraa.leads.careers.repository.JobApplicationRepository;
import com.arooraa.leads.careers.storage.ValidatedResume;
import com.arooraa.leads.careers.web.dto.JobApplicationCreateRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * The actual database insert + durable notification-intent creation, as one transaction
 * (W3.3B §10, §14). Kept as its own bean — not a private method on {@link JobApplicationService}
 * — for the exact reason {@code NotificationOutboxProcessor} documents: a same-class
 * self-invocation of a {@code @Transactional} method silently skips Spring's proxy, which would
 * break the atomicity this class exists to provide. {@link JobApplicationService} calls this as
 * a genuine cross-bean call, then performs the (necessarily non-transactional) résumé
 * promote/discard step itself, after this method returns.
 */
@Component
class JobApplicationPersistenceService {

    private final JobApplicationRepository repository;
    private final ApplicationReferenceGenerator referenceGenerator;
    private final JobApplicationNotificationService notificationService;

    JobApplicationPersistenceService(JobApplicationRepository repository,
                                      ApplicationReferenceGenerator referenceGenerator,
                                      JobApplicationNotificationService notificationService) {
        this.repository = repository;
        this.referenceGenerator = referenceGenerator;
        this.notificationService = notificationService;
    }

    @Transactional
    JobApplication persist(JobApplicationCreateRequest request, RecruitmentJob job, ValidatedResume resume,
                            String resumeStorageKey, String ipHash, String idempotencyKey, String fingerprint) {
        String reference = referenceGenerator.next();

        JobApplication application = new JobApplication(
                reference, job.slug(), job.title(),
                request.fullName().trim(), request.email().trim(), request.phone().trim(),
                blankToNull(request.currentLocation()), blankToNull(request.experience()),
                blankToNull(request.linkedinUrl()), blankToNull(request.portfolioUrl()), blankToNull(request.note()),
                request.recruitmentConsent(), ipHash);

        if (resume != null) {
            application.attachResume(resumeStorageKey, resume.sanitizedOriginalFilename(), resume.contentType(), resume.size());
        }
        if (idempotencyKey != null) {
            application.applyIdempotency(idempotencyKey, fingerprint);
        }

        JobApplication saved = repository.save(application);
        // Same transaction as the insert above — commits or rolls back together.
        notificationService.createIntents(saved);
        return saved;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
