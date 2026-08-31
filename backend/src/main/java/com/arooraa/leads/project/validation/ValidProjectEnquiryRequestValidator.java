package com.arooraa.leads.project.validation;

import com.arooraa.leads.project.domain.SubmissionVersion;
import com.arooraa.leads.project.web.dto.ProjectEnquiryCreateRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * The two submission shapes require different field groups (W3.2B §3, §12): LEGACY needs
 * serviceType/projectType/description/existingSystem/budgetRange/timeline; GUIDED needs
 * solutionModel/engagementModel/problemStatement/projectStage/at least one productType/
 * guidedTimeline. Bean-validation annotations on the record components can't express "required
 * only if submissionVersion is X", so that's done here instead — reported as ordinary field
 * violations, so the existing 400 VALIDATION_ERROR / fieldErrors response shape is unchanged.
 */
public class ValidProjectEnquiryRequestValidator
        implements ConstraintValidator<ValidProjectEnquiryRequest, ProjectEnquiryCreateRequest> {

    @Override
    public boolean isValid(ProjectEnquiryCreateRequest request, ConstraintValidatorContext context) {
        if (request == null || request.submissionVersion() == null) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        boolean valid = true;

        if (request.submissionVersion() == SubmissionVersion.LEGACY) {
            valid &= requireNotNull(context, request.serviceType(), "serviceType");
            valid &= requireNotNull(context, request.projectType(), "projectType");
            valid &= requireNotBlank(context, request.description(), "description");
            valid &= requireNotNull(context, request.existingSystem(), "existingSystem");
            valid &= requireNotNull(context, request.budgetRange(), "budgetRange");
            valid &= requireNotNull(context, request.timeline(), "timeline");
        } else {
            valid &= requireNotNull(context, request.solutionModel(), "solutionModel");
            valid &= requireNotNull(context, request.engagementModel(), "engagementModel");
            valid &= requireNotBlank(context, request.problemStatement(), "problemStatement");
            valid &= requireNotNull(context, request.projectStage(), "projectStage");
            valid &= requireNotNull(context, request.guidedTimeline(), "guidedTimeline");
            if (request.productTypes() == null || request.productTypes().isEmpty()) {
                addViolation(context, "productTypes", "must not be empty");
                valid = false;
            }
        }

        return valid;
    }

    private static boolean requireNotNull(ConstraintValidatorContext context, Object value, String field) {
        if (value == null) {
            addViolation(context, field, "must not be null");
            return false;
        }
        return true;
    }

    private static boolean requireNotBlank(ConstraintValidatorContext context, String value, String field) {
        if (value == null || value.isBlank()) {
            addViolation(context, field, "must not be blank");
            return false;
        }
        return true;
    }

    private static void addViolation(ConstraintValidatorContext context, String field, String message) {
        context.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(field)
                .addConstraintViolation();
    }
}
