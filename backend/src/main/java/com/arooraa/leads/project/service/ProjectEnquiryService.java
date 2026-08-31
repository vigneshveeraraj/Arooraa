package com.arooraa.leads.project.service;

import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.domain.SubmissionVersion;
import com.arooraa.leads.project.exception.IdempotencyConflictException;
import com.arooraa.leads.project.notification.service.LeadNotificationService;
import com.arooraa.leads.project.repository.ProjectEnquiryRepository;
import com.arooraa.leads.project.web.dto.ProjectEnquiryCreateRequest;
import com.arooraa.leads.project.web.dto.ProjectEnquiryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectEnquiryService {

    private static final Logger log = LoggerFactory.getLogger(ProjectEnquiryService.class);
    private static final String DEFAULT_SOURCE = "WEBSITE";

    private final ProjectEnquiryRepository repository;
    private final EnquiryNumberGenerator enquiryNumberGenerator;
    private final ProjectEnquiryRateLimiter rateLimiter;
    private final LeadNotificationService leadNotificationService;
    private final Duration duplicateWindow;

    public ProjectEnquiryService(ProjectEnquiryRepository repository,
                                  EnquiryNumberGenerator enquiryNumberGenerator,
                                  ProjectEnquiryRateLimiter rateLimiter,
                                  LeadNotificationService leadNotificationService,
                                  @Value("${arooraa.project-enquiry.duplicate.window-minutes:5}") long duplicateWindowMinutes) {
        this.repository = repository;
        this.enquiryNumberGenerator = enquiryNumberGenerator;
        this.rateLimiter = rateLimiter;
        this.leadNotificationService = leadNotificationService;
        this.duplicateWindow = Duration.ofMinutes(duplicateWindowMinutes);
    }

    /** Pre-W3.2B call shape — no idempotency key. Delegates to the 4-arg overload below. */
    @Transactional
    public ProjectEnquirySubmitOutcome submit(ProjectEnquiryCreateRequest request, String ipHash, String userAgent) {
        return submit(request, ipHash, userAgent, null);
    }

    /**
     * W3.2B: {@code idempotencyKey}, when present, replaces the legacy time-window duplicate
     * heuristic for this request with an exact replay check (same key + same payload
     * fingerprint → return the original outcome again, no new row; same key + different
     * fingerprint → reject as a conflict). The two mechanisms serve different callers: legacy
     * requests never carry a key and keep using the coarse phone+email+recency heuristic
     * unchanged; guided requests always carry a key and get the more precise mechanism instead
     * of — not in addition to — the heuristic, since the heuristic would otherwise treat two
     * genuinely different guided enquiries from the same person as duplicates.
     */
    @Transactional
    public ProjectEnquirySubmitOutcome submit(ProjectEnquiryCreateRequest request, String ipHash, String userAgent,
                                               String idempotencyKey) {
        if (!rateLimiter.tryAcquire(ipHash)) {
            log.warn("project-enquiry rejected reason=RATE_LIMITED ipHashPrefix={}", prefix(ipHash));
            throw new RateLimitExceededException();
        }

        // An oversized or malformed key can't possibly match a stored one, so it's treated the
        // same as no key at all (falls back to the legacy heuristic) rather than surfacing a
        // client-input error for what is, from the caller's perspective, an optional header.
        String trimmedKey = idempotencyKey == null ? null : idempotencyKey.trim();
        String normalizedKey = (trimmedKey == null || trimmedKey.isEmpty() || trimmedKey.length() > 100)
                ? null : trimmedKey;

        if (normalizedKey != null) {
            String fingerprint = RequestFingerprint.of(request);
            Optional<ProjectEnquiry> existingByKey = repository.findByIdempotencyKey(normalizedKey);
            if (existingByKey.isPresent()) {
                return replay(existingByKey.get(), fingerprint);
            }
            return create(request, ipHash, userAgent, normalizedKey, fingerprint);
        }

        String normalizedPhone = InternationalPhoneNormalizer.normalize(request.phone());
        Instant since = Instant.now().minus(duplicateWindow);
        List<ProjectEnquiry> duplicates =
                repository.findRecentDuplicates(normalizedPhone, request.businessEmail(), since);
        if (!duplicates.isEmpty()) {
            ProjectEnquiry existing = duplicates.get(0);
            log.info("project-enquiry duplicate detected enquiryNumber={}", existing.getEnquiryNumber());
            return new ProjectEnquirySubmitOutcome.DuplicateDetected(new ProjectEnquiryResponse(
                    existing.getId(), existing.getEnquiryNumber(), ProjectEnquiryResponse.STATUS_ALREADY_RECEIVED,
                    ProjectEnquiryResponse.ALREADY_RECEIVED_MESSAGE));
        }

        return create(request, ipHash, userAgent, null, null);
    }

    private ProjectEnquirySubmitOutcome replay(ProjectEnquiry existing, String fingerprint) {
        if (!fingerprint.equals(existing.getRequestFingerprint())) {
            log.warn("project-enquiry idempotency conflict enquiryNumber={}", existing.getEnquiryNumber());
            throw new IdempotencyConflictException();
        }
        log.info("project-enquiry idempotent replay enquiryNumber={}", existing.getEnquiryNumber());
        return new ProjectEnquirySubmitOutcome.DuplicateDetected(new ProjectEnquiryResponse(
                existing.getId(), existing.getEnquiryNumber(), ProjectEnquiryResponse.STATUS_ALREADY_RECEIVED,
                ProjectEnquiryResponse.ALREADY_RECEIVED_MESSAGE));
    }

    private ProjectEnquirySubmitOutcome create(ProjectEnquiryCreateRequest request, String ipHash, String userAgent,
                                                String idempotencyKey, String fingerprint) {
        boolean legacy = request.submissionVersion() == SubmissionVersion.LEGACY;
        String normalizedPhone = InternationalPhoneNormalizer.normalize(request.phone());
        String enquiryNumber = enquiryNumberGenerator.next();
        String source = request.source() == null || request.source().isBlank() ? DEFAULT_SOURCE : request.source();

        ProjectEnquiry entity = new ProjectEnquiry(
                enquiryNumber, request.name(), request.companyName(), request.businessEmail(),
                request.phone(), normalizedPhone, request.country(),
                legacy ? request.serviceType() : null,
                legacy ? request.projectType() : null,
                legacy ? request.description() : null,
                legacy ? Boolean.TRUE.equals(request.existingSystem()) : null,
                legacy ? request.budgetRange() : null,
                legacy ? request.timeline() : null,
                request.preferredContactMethod(), source, request.sourcePage(),
                ipHash, userAgent, request.referrer(), request.utmSource(), request.utmMedium(),
                request.utmCampaign());

        if (!legacy) {
            entity.applyGuidedFields(request.solutionModel(), request.engagementModel(), request.problemStatement(),
                    request.projectStage(), new LinkedHashSet<>(request.productTypes()), request.guidedTimeline(),
                    request.guidedBudgetRange(), request.existingSystemContext(), request.role(),
                    request.countryCode(), request.preferredContactTime(),
                    Boolean.TRUE.equals(request.whatsappConsent()), request.sourceContext(), request.entryRoute(),
                    request.utmContent());
        }
        if (idempotencyKey != null) {
            entity.applyIdempotency(idempotencyKey, fingerprint);
        }

        ProjectEnquiry saved = repository.save(entity);
        // Same transaction as the insert above — commits or rolls back together (W3.2C §10).
        // Applies to every newly-created enquiry, legacy or guided (W3.2C §32): neither
        // submission shape has ever sent any acknowledgement before this milestone.
        leadNotificationService.createIntents(saved);
        log.info("project-enquiry accepted enquiryNumber={} submissionVersion={}",
                saved.getEnquiryNumber(), saved.getSubmissionVersion());

        return new ProjectEnquirySubmitOutcome.Created(new ProjectEnquiryResponse(
                saved.getId(), saved.getEnquiryNumber(), ProjectEnquiryResponse.STATUS_RECEIVED,
                ProjectEnquiryResponse.DEFAULT_MESSAGE));
    }

    private static String prefix(String hash) {
        return hash.length() > 8 ? hash.substring(0, 8) : hash;
    }
}
