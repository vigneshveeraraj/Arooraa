package com.arooraa.leads.project.web.dto;

import com.arooraa.leads.project.domain.BudgetRange;
import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.ProjectType;
import com.arooraa.leads.project.domain.ServiceType;
import com.arooraa.leads.project.domain.Timeline;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;

class ProjectEnquiryCreateRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeFactory() {
        factory.close();
    }

    private static ProjectEnquiryCreateRequest valid() {
        return new ProjectEnquiryCreateRequest(
                "Arun Kumar", "ABC Logistics", "arun@example.com", "+919876543210", "India",
                ServiceType.CUSTOM_SOFTWARE, ProjectType.NEW_PRODUCT,
                "We need a logistics tracking platform for our operations across five cities.", false,
                BudgetRange.FROM_2L_TO_5L, Timeline.FROM_1_TO_3_MONTHS, PreferredContactMethod.PHONE,
                "WEBSITE", "/start-project", null, null, null, null, "");
    }

    @Test
    void validRequestHasNoViolations() {
        assertTrue(validator.validate(valid()).isEmpty());
    }

    @Test
    void rejectsBlankName() {
        ProjectEnquiryCreateRequest req = withName("   ");
        assertHasViolationOn(req, "name");
    }

    @Test
    void rejectsInvalidBusinessEmail() {
        ProjectEnquiryCreateRequest v = valid();
        ProjectEnquiryCreateRequest req = new ProjectEnquiryCreateRequest(
                v.name(), v.companyName(), "not-an-email", v.phone(), v.country(), v.serviceType(),
                v.projectType(), v.description(), v.existingSystem(), v.budgetRange(), v.timeline(),
                v.preferredContactMethod(), v.source(), v.sourcePage(), v.referrer(), v.utmSource(), v.utmMedium(),
                v.utmCampaign(), v.website());
        assertHasViolationOn(req, "businessEmail");
    }

    @Test
    void acceptsGenericEmailProviders() {
        for (String email : new String[] {"founder@gmail.com", "team@outlook.com", "hello@yahoo.com"}) {
            ProjectEnquiryCreateRequest v = valid();
            ProjectEnquiryCreateRequest req = new ProjectEnquiryCreateRequest(
                    v.name(), v.companyName(), email, v.phone(), v.country(), v.serviceType(), v.projectType(),
                    v.description(), v.existingSystem(), v.budgetRange(), v.timeline(), v.preferredContactMethod(),
                    v.source(), v.sourcePage(), v.referrer(), v.utmSource(), v.utmMedium(), v.utmCampaign(),
                    v.website());
            assertTrue(validator.validate(req).isEmpty(), "expected " + email + " to be accepted");
        }
    }

    @Test
    void rejectsInvalidPhone() {
        ProjectEnquiryCreateRequest v = valid();
        ProjectEnquiryCreateRequest req = new ProjectEnquiryCreateRequest(
                v.name(), v.companyName(), v.businessEmail(), "12345", v.country(), v.serviceType(),
                v.projectType(), v.description(), v.existingSystem(), v.budgetRange(), v.timeline(),
                v.preferredContactMethod(), v.source(), v.sourcePage(), v.referrer(), v.utmSource(), v.utmMedium(),
                v.utmCampaign(), v.website());
        assertHasViolationOn(req, "phone");
    }

    @Test
    void rejectsBlankCountry() {
        ProjectEnquiryCreateRequest v = valid();
        ProjectEnquiryCreateRequest req = new ProjectEnquiryCreateRequest(
                v.name(), v.companyName(), v.businessEmail(), v.phone(), " ", v.serviceType(), v.projectType(),
                v.description(), v.existingSystem(), v.budgetRange(), v.timeline(), v.preferredContactMethod(),
                v.source(), v.sourcePage(), v.referrer(), v.utmSource(), v.utmMedium(), v.utmCampaign(),
                v.website());
        assertHasViolationOn(req, "country");
    }

    @Test
    void rejectsMissingServiceType() {
        ProjectEnquiryCreateRequest v = valid();
        ProjectEnquiryCreateRequest req = new ProjectEnquiryCreateRequest(
                v.name(), v.companyName(), v.businessEmail(), v.phone(), v.country(), null, v.projectType(),
                v.description(), v.existingSystem(), v.budgetRange(), v.timeline(), v.preferredContactMethod(),
                v.source(), v.sourcePage(), v.referrer(), v.utmSource(), v.utmMedium(), v.utmCampaign(),
                v.website());
        assertHasViolationOn(req, "serviceType");
    }

    @Test
    void rejectsTooShortDescription() {
        ProjectEnquiryCreateRequest v = valid();
        ProjectEnquiryCreateRequest req = new ProjectEnquiryCreateRequest(
                v.name(), v.companyName(), v.businessEmail(), v.phone(), v.country(), v.serviceType(),
                v.projectType(), "too short", v.existingSystem(), v.budgetRange(), v.timeline(),
                v.preferredContactMethod(), v.source(), v.sourcePage(), v.referrer(), v.utmSource(), v.utmMedium(),
                v.utmCampaign(), v.website());
        assertHasViolationOn(req, "description");
    }

    @Test
    void rejectsMissingBudgetRange() {
        ProjectEnquiryCreateRequest v = valid();
        ProjectEnquiryCreateRequest req = new ProjectEnquiryCreateRequest(
                v.name(), v.companyName(), v.businessEmail(), v.phone(), v.country(), v.serviceType(),
                v.projectType(), v.description(), v.existingSystem(), null, v.timeline(),
                v.preferredContactMethod(), v.source(), v.sourcePage(), v.referrer(), v.utmSource(), v.utmMedium(),
                v.utmCampaign(), v.website());
        assertHasViolationOn(req, "budgetRange");
    }

    @Test
    void rejectsPopulatedHoneypotField() {
        ProjectEnquiryCreateRequest v = valid();
        ProjectEnquiryCreateRequest req = new ProjectEnquiryCreateRequest(
                v.name(), v.companyName(), v.businessEmail(), v.phone(), v.country(), v.serviceType(),
                v.projectType(), v.description(), v.existingSystem(), v.budgetRange(), v.timeline(),
                v.preferredContactMethod(), v.source(), v.sourcePage(), v.referrer(), v.utmSource(), v.utmMedium(),
                v.utmCampaign(), "http://spam.example");
        assertHasViolationOn(req, "website");
    }

    @Test
    void trimsSurroundingWhitespaceFromTextFields() {
        ProjectEnquiryCreateRequest v = valid();
        ProjectEnquiryCreateRequest req = new ProjectEnquiryCreateRequest(
                "  Arun Kumar  ", v.companyName(), v.businessEmail(), v.phone(), v.country(), v.serviceType(),
                v.projectType(), v.description(), v.existingSystem(), v.budgetRange(), v.timeline(),
                v.preferredContactMethod(), v.source(), v.sourcePage(), v.referrer(), v.utmSource(), v.utmMedium(),
                v.utmCampaign(), v.website());
        assertTrue(req.name().equals("Arun Kumar"));
    }

    private static ProjectEnquiryCreateRequest withName(String name) {
        ProjectEnquiryCreateRequest v = valid();
        return new ProjectEnquiryCreateRequest(
                name, v.companyName(), v.businessEmail(), v.phone(), v.country(), v.serviceType(), v.projectType(),
                v.description(), v.existingSystem(), v.budgetRange(), v.timeline(), v.preferredContactMethod(),
                v.source(), v.sourcePage(), v.referrer(), v.utmSource(), v.utmMedium(), v.utmCampaign(),
                v.website());
    }

    private static void assertHasViolationOn(ProjectEnquiryCreateRequest request, String propertyName) {
        Set<ConstraintViolation<ProjectEnquiryCreateRequest>> violations = validator.validate(request);
        Set<String> fields = violations.stream()
                .map(v -> v.getPropertyPath().toString())
                .collect(Collectors.toSet());
        assertTrue(fields.contains(propertyName), "expected violation on " + propertyName + " but got " + fields);
    }
}
