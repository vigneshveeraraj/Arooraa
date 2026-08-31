package com.arooraa.leads.careers.service;

import com.arooraa.leads.careers.exception.RecruitmentValidationException;
import com.arooraa.leads.careers.web.dto.JobApplicationCreateRequest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JobApplicationRequestValidatorTest {

    private final JobApplicationRequestValidator validator = new JobApplicationRequestValidator();

    private static JobApplicationCreateRequest validRequest() {
        return new JobApplicationCreateRequest("ai-engineer", "Priya Sharma", "priya@example.com", "+919876543210",
                "Chennai", "3 years", "https://linkedin.com/in/priya", "https://github.com/priya", "Interested!",
                true, "resume.pdf", "application/pdf", 1024L);
    }

    @Test
    void acceptsAFullyValidRequest() {
        assertDoesNotThrow(() -> validator.validate(validRequest()));
    }

    @Test
    void rejectsMissingConsent() {
        JobApplicationCreateRequest request = withConsent(validRequest(), false);
        RecruitmentValidationException ex = assertThrows(RecruitmentValidationException.class, () -> validator.validate(request));
        assertTrue(ex.fieldErrors().containsKey("recruitmentConsent"));
    }

    @Test
    void rejectsAnInvalidEmail() {
        JobApplicationCreateRequest request = withEmail(validRequest(), "not-an-email");
        RecruitmentValidationException ex = assertThrows(RecruitmentValidationException.class, () -> validator.validate(request));
        assertTrue(ex.fieldErrors().containsKey("email"));
    }

    @Test
    void rejectsAnInvalidLinkedInUrl() {
        JobApplicationCreateRequest request = withLinkedin(validRequest(), "not a url");
        RecruitmentValidationException ex = assertThrows(RecruitmentValidationException.class, () -> validator.validate(request));
        assertTrue(ex.fieldErrors().containsKey("linkedinUrl"));
    }

    @Test
    void rejectsANonHttpPortfolioUrl() {
        JobApplicationCreateRequest request = withPortfolio(validRequest(), "javascript:alert(1)");
        RecruitmentValidationException ex = assertThrows(RecruitmentValidationException.class, () -> validator.validate(request));
        assertTrue(ex.fieldErrors().containsKey("portfolioUrl"));
    }

    @Test
    void allowsBlankOptionalUrls() {
        JobApplicationCreateRequest request = withPortfolio(withLinkedin(validRequest(), null), "");
        assertDoesNotThrow(() -> validator.validate(request));
    }

    @Test
    void rejectsAMissingJobSlug() {
        JobApplicationCreateRequest request = withJobSlug(validRequest(), null);
        RecruitmentValidationException ex = assertThrows(RecruitmentValidationException.class, () -> validator.validate(request));
        assertTrue(ex.fieldErrors().containsKey("jobSlug"));
    }

    @Test
    void rejectsAnInvalidPhoneNumber() {
        JobApplicationCreateRequest request = withPhone(validRequest(), "abc");
        RecruitmentValidationException ex = assertThrows(RecruitmentValidationException.class, () -> validator.validate(request));
        assertTrue(ex.fieldErrors().containsKey("phone"));
    }

    @Test
    void rejectsAMissingFullName() {
        JobApplicationCreateRequest request = withFullName(validRequest(), "  ");
        RecruitmentValidationException ex = assertThrows(RecruitmentValidationException.class, () -> validator.validate(request));
        assertTrue(ex.fieldErrors().containsKey("fullName"));
    }

    private static JobApplicationCreateRequest withConsent(JobApplicationCreateRequest r, boolean consent) {
        return new JobApplicationCreateRequest(r.jobSlug(), r.fullName(), r.email(), r.phone(), r.currentLocation(),
                r.experience(), r.linkedinUrl(), r.portfolioUrl(), r.note(), consent, r.resumeOriginalFilename(),
                r.resumeContentType(), r.resumeSize());
    }

    private static JobApplicationCreateRequest withEmail(JobApplicationCreateRequest r, String email) {
        return new JobApplicationCreateRequest(r.jobSlug(), r.fullName(), email, r.phone(), r.currentLocation(),
                r.experience(), r.linkedinUrl(), r.portfolioUrl(), r.note(), r.recruitmentConsent(),
                r.resumeOriginalFilename(), r.resumeContentType(), r.resumeSize());
    }

    private static JobApplicationCreateRequest withLinkedin(JobApplicationCreateRequest r, String linkedin) {
        return new JobApplicationCreateRequest(r.jobSlug(), r.fullName(), r.email(), r.phone(), r.currentLocation(),
                r.experience(), linkedin, r.portfolioUrl(), r.note(), r.recruitmentConsent(),
                r.resumeOriginalFilename(), r.resumeContentType(), r.resumeSize());
    }

    private static JobApplicationCreateRequest withPortfolio(JobApplicationCreateRequest r, String portfolio) {
        return new JobApplicationCreateRequest(r.jobSlug(), r.fullName(), r.email(), r.phone(), r.currentLocation(),
                r.experience(), r.linkedinUrl(), portfolio, r.note(), r.recruitmentConsent(),
                r.resumeOriginalFilename(), r.resumeContentType(), r.resumeSize());
    }

    private static JobApplicationCreateRequest withJobSlug(JobApplicationCreateRequest r, String jobSlug) {
        return new JobApplicationCreateRequest(jobSlug, r.fullName(), r.email(), r.phone(), r.currentLocation(),
                r.experience(), r.linkedinUrl(), r.portfolioUrl(), r.note(), r.recruitmentConsent(),
                r.resumeOriginalFilename(), r.resumeContentType(), r.resumeSize());
    }

    private static JobApplicationCreateRequest withPhone(JobApplicationCreateRequest r, String phone) {
        return new JobApplicationCreateRequest(r.jobSlug(), r.fullName(), r.email(), phone, r.currentLocation(),
                r.experience(), r.linkedinUrl(), r.portfolioUrl(), r.note(), r.recruitmentConsent(),
                r.resumeOriginalFilename(), r.resumeContentType(), r.resumeSize());
    }

    private static JobApplicationCreateRequest withFullName(JobApplicationCreateRequest r, String fullName) {
        return new JobApplicationCreateRequest(r.jobSlug(), fullName, r.email(), r.phone(), r.currentLocation(),
                r.experience(), r.linkedinUrl(), r.portfolioUrl(), r.note(), r.recruitmentConsent(),
                r.resumeOriginalFilename(), r.resumeContentType(), r.resumeSize());
    }
}
