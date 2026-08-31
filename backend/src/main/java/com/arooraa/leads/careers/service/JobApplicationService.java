package com.arooraa.leads.careers.service;

import com.arooraa.leads.careers.domain.JobApplication;
import com.arooraa.leads.careers.exception.RecruitmentIdempotencyConflictException;
import com.arooraa.leads.careers.exception.UnknownOrClosedJobException;
import com.arooraa.leads.careers.registry.RecruitmentJob;
import com.arooraa.leads.careers.registry.RecruitmentJobRegistry;
import com.arooraa.leads.careers.repository.JobApplicationRepository;
import com.arooraa.leads.careers.storage.ResumeStorage;
import com.arooraa.leads.careers.storage.ResumeValidator;
import com.arooraa.leads.careers.storage.ValidatedResume;
import com.arooraa.leads.careers.web.dto.JobApplicationCreateRequest;
import com.arooraa.leads.careers.web.dto.JobApplicationResponse;
import com.arooraa.leads.exception.RateLimitExceededException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

/**
 * Orchestrates one application submission end to end (W3.3B §5-10). Deliberately NOT
 * {@code @Transactional} itself — a résumé file write is not a database operation and can never
 * join the same transaction as one, so this class makes the two-phase reality explicit instead
 * of pretending otherwise: {@link JobApplicationPersistenceService#persist} is the only truly
 * transactional step; staging happens before it, promote/discard happens after it returns.
 *
 * <p><b>Crash-boundary honesty (W3.3B §10):</b> if the process crashes after the persistence
 * transaction commits but before {@link ResumeStorage#promote} runs, the database row exists
 * with a {@code resumeStorageKey} that is still sitting in temporary storage, not yet at its
 * final location — a small, real, documented window. This design cannot eliminate that window
 * without a real distributed transaction (explicitly not required — W3.3B §10), but it keeps
 * the window as short as possible (promote is the very next statement after commit) and it
 * never leaves the opposite, worse failure: a résumé permanently stored with no matching
 * application row (promote only ever runs after the row is confirmed committed).
 */
@Service
public class JobApplicationService {

    private static final Logger log = LoggerFactory.getLogger(JobApplicationService.class);

    private final RecruitmentJobRegistry jobRegistry;
    private final JobApplicationRequestValidator requestValidator;
    private final ResumeValidator resumeValidator;
    private final ResumeStorage resumeStorage;
    private final JobApplicationRepository repository;
    private final JobApplicationPersistenceService persistenceService;
    private final JobApplicationRateLimiter rateLimiter;

    public JobApplicationService(RecruitmentJobRegistry jobRegistry, JobApplicationRequestValidator requestValidator,
                                  ResumeValidator resumeValidator, ResumeStorage resumeStorage,
                                  JobApplicationRepository repository, JobApplicationPersistenceService persistenceService,
                                  JobApplicationRateLimiter rateLimiter) {
        this.jobRegistry = jobRegistry;
        this.requestValidator = requestValidator;
        this.resumeValidator = resumeValidator;
        this.resumeStorage = resumeStorage;
        this.repository = repository;
        this.persistenceService = persistenceService;
        this.rateLimiter = rateLimiter;
    }

    public JobApplicationSubmitOutcome submit(JobApplicationCreateRequest request, MultipartFile resumeFile,
                                               String ipHash, String idempotencyKey) {
        if (!rateLimiter.tryAcquire(ipHash)) {
            log.warn("job-application rejected reason=RATE_LIMITED ipHashPrefix={}", prefix(ipHash));
            throw new RateLimitExceededException();
        }

        requestValidator.validate(request);

        RecruitmentJob job = jobRegistry.findAcceptingApplications(request.jobSlug())
                .orElseThrow(UnknownOrClosedJobException::new);

        // An oversized or malformed key can't possibly match a stored one — treated as no key
        // at all rather than a client-input error, mirroring ProjectEnquiryService.
        String trimmedKey = idempotencyKey == null ? null : idempotencyKey.trim();
        String normalizedKey = (trimmedKey == null || trimmedKey.isEmpty() || trimmedKey.length() > 100) ? null : trimmedKey;

        if (normalizedKey != null) {
            String fingerprint = RequestFingerprint.of(request);
            Optional<JobApplication> existing = repository.findByIdempotencyKey(normalizedKey);
            if (existing.isPresent()) {
                // Replay path never touches résumé validation or storage (W3.3B §9: "do not
                // create duplicate DB rows or duplicate résumé objects on retry").
                return replay(existing.get(), fingerprint);
            }
            return create(request, resumeFile, job, ipHash, normalizedKey, fingerprint);
        }

        return create(request, resumeFile, job, ipHash, null, null);
    }

    private JobApplicationSubmitOutcome replay(JobApplication existing, String fingerprint) {
        if (!fingerprint.equals(existing.getRequestFingerprint())) {
            log.warn("job-application idempotency conflict reference={}", existing.getApplicationReference());
            throw new RecruitmentIdempotencyConflictException();
        }
        log.info("job-application idempotent replay reference={}", existing.getApplicationReference());
        return new JobApplicationSubmitOutcome.DuplicateDetected(new JobApplicationResponse(
                existing.getApplicationReference(), JobApplicationResponse.STATUS_RECEIVED, existing.getJobSlug(),
                JobApplicationResponse.ALREADY_RECEIVED_MESSAGE));
    }

    private JobApplicationSubmitOutcome create(JobApplicationCreateRequest request, MultipartFile resumeFile,
                                                RecruitmentJob job, String ipHash, String idempotencyKey, String fingerprint) {
        ValidatedResume validatedResume = (resumeFile == null || resumeFile.isEmpty())
                ? null : resumeValidator.validate(resumeFile);

        String storageKey = validatedResume == null ? null : resumeStorage.stage(validatedResume);
        try {
            JobApplication saved = persistenceService.persist(
                    request, job, validatedResume, storageKey, ipHash, idempotencyKey, fingerprint);
            if (storageKey != null) {
                // Only ever runs after the row above is confirmed committed — see class Javadoc.
                resumeStorage.promote(storageKey);
            }
            log.info("job-application accepted reference={} jobSlug={} resumeAttached={}",
                    saved.getApplicationReference(), saved.getJobSlug(), storageKey != null);
            return new JobApplicationSubmitOutcome.Created(new JobApplicationResponse(
                    saved.getApplicationReference(), JobApplicationResponse.STATUS_RECEIVED, saved.getJobSlug(),
                    JobApplicationResponse.DEFAULT_MESSAGE));
        } catch (RuntimeException e) {
            if (storageKey != null) {
                resumeStorage.discard(storageKey);
            }
            throw e;
        }
    }

    private static String prefix(String hash) {
        return hash.length() > 8 ? hash.substring(0, 8) : hash;
    }
}
