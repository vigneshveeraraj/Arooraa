package com.arooraa.leads.project.service;

import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.project.domain.ProjectEnquiry;
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
import java.util.List;

@Service
public class ProjectEnquiryService {

    private static final Logger log = LoggerFactory.getLogger(ProjectEnquiryService.class);
    private static final String DEFAULT_SOURCE = "WEBSITE";

    private final ProjectEnquiryRepository repository;
    private final EnquiryNumberGenerator enquiryNumberGenerator;
    private final ProjectEnquiryRateLimiter rateLimiter;
    private final Duration duplicateWindow;

    public ProjectEnquiryService(ProjectEnquiryRepository repository,
                                  EnquiryNumberGenerator enquiryNumberGenerator,
                                  ProjectEnquiryRateLimiter rateLimiter,
                                  @Value("${arooraa.project-enquiry.duplicate.window-minutes:5}") long duplicateWindowMinutes) {
        this.repository = repository;
        this.enquiryNumberGenerator = enquiryNumberGenerator;
        this.rateLimiter = rateLimiter;
        this.duplicateWindow = Duration.ofMinutes(duplicateWindowMinutes);
    }

    @Transactional
    public ProjectEnquirySubmitOutcome submit(ProjectEnquiryCreateRequest request, String ipHash, String userAgent) {
        if (!rateLimiter.tryAcquire(ipHash)) {
            log.warn("project-enquiry rejected reason=RATE_LIMITED ipHashPrefix={}", prefix(ipHash));
            throw new RateLimitExceededException();
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

        String enquiryNumber = enquiryNumberGenerator.next();
        String source = request.source() == null || request.source().isBlank() ? DEFAULT_SOURCE : request.source();

        ProjectEnquiry entity = new ProjectEnquiry(
                enquiryNumber, request.name(), request.companyName(), request.businessEmail(),
                request.phone(), normalizedPhone, request.country(), request.serviceType(), request.projectType(),
                request.description(), Boolean.TRUE.equals(request.existingSystem()), request.budgetRange(),
                request.timeline(), request.preferredContactMethod(), source, request.sourcePage(),
                ipHash, userAgent, request.referrer(), request.utmSource(), request.utmMedium(),
                request.utmCampaign());

        ProjectEnquiry saved = repository.save(entity);
        log.info("project-enquiry accepted enquiryNumber={} serviceType={} projectType={} budgetRange={}",
                saved.getEnquiryNumber(), saved.getServiceType(), saved.getProjectType(), saved.getBudgetRange());

        return new ProjectEnquirySubmitOutcome.Created(new ProjectEnquiryResponse(
                saved.getId(), saved.getEnquiryNumber(), ProjectEnquiryResponse.STATUS_RECEIVED,
                ProjectEnquiryResponse.DEFAULT_MESSAGE));
    }

    private static String prefix(String hash) {
        return hash.length() > 8 ? hash.substring(0, 8) : hash;
    }
}
