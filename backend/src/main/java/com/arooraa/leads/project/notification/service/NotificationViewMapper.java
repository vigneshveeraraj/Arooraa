package com.arooraa.leads.project.notification.service;

import com.arooraa.leads.project.domain.PreferredContactMethod;
import com.arooraa.leads.project.domain.ProjectEnquiry;
import com.arooraa.leads.project.domain.SubmissionVersion;
import com.arooraa.leads.project.notification.support.EnumHumanizer;
import com.arooraa.leads.project.notification.template.CustomerAcknowledgementView;
import com.arooraa.leads.project.notification.template.InternalSalesAlertView;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

/**
 * Maps a persisted {@link ProjectEnquiry} onto the two template view models. Handles both
 * submission shapes (W3.2C §32) — GUIDED rows read the guided-only columns; LEGACY rows fall
 * back to their nearest legacy equivalent (solutionModel -> projectType, engagementModel ->
 * serviceType, guidedTimeline -> timeline, guidedBudgetRange -> budgetRange, problemStatement ->
 * description), the same null-guarded-by-submission-version pattern AdminLeadQueryService
 * already uses for admin display.
 */
final class NotificationViewMapper {

    private static final int PROBLEM_PREVIEW_MAX_CHARS = 400;
    private static final DateTimeFormatter RECEIVED_AT_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm 'UTC'").withZone(ZoneOffset.UTC);

    private NotificationViewMapper() {
    }

    static CustomerAcknowledgementView toCustomerAcknowledgementView(ProjectEnquiry enquiry) {
        boolean guided = enquiry.getSubmissionVersion() == SubmissionVersion.GUIDED;
        String problemSource = guided ? enquiry.getProblemStatement() : enquiry.getDescription();

        return new CustomerAcknowledgementView(
                enquiry.getEnquiryNumber(),
                enquiry.getName(),
                guided ? EnumHumanizer.humanize(enquiry.getSolutionModel()) : EnumHumanizer.humanize(enquiry.getProjectType()),
                guided ? EnumHumanizer.humanize(enquiry.getEngagementModel()) : EnumHumanizer.humanize(enquiry.getServiceType()),
                EnumHumanizer.humanize(enquiry.getProjectStage()),
                guided ? EnumHumanizer.humanize(enquiry.getGuidedTimeline()) : EnumHumanizer.humanize(enquiry.getTimeline()),
                EnumHumanizer.humanize(enquiry.getPreferredContactMethod()),
                truncate(problemSource));
    }

    static InternalSalesAlertView toInternalSalesAlertView(ProjectEnquiry enquiry) {
        boolean guided = enquiry.getSubmissionVersion() == SubmissionVersion.GUIDED;
        String problemSource = guided ? enquiry.getProblemStatement() : enquiry.getDescription();
        String productTypes = (enquiry.getProductTypes() == null || enquiry.getProductTypes().isEmpty())
                ? null
                : enquiry.getProductTypes().stream()
                        .map(EnumHumanizer::humanize)
                        .sorted()
                        .collect(Collectors.joining(", "));
        String existingSystemNote = guided
                ? enquiry.getExistingSystemContext()
                : (enquiry.getExistingSystem() == null ? null : (enquiry.getExistingSystem() ? "Yes" : "No"));
        boolean preferredIsPhone = enquiry.getPreferredContactMethod() == PreferredContactMethod.PHONE;
        boolean preferredIsWhatsapp = enquiry.getPreferredContactMethod() == PreferredContactMethod.WHATSAPP;
        Boolean whatsappConsent = preferredIsWhatsapp ? enquiry.isWhatsappConsent() : null;

        return new InternalSalesAlertView(
                enquiry.getEnquiryNumber(),
                RECEIVED_AT_FORMAT.format(enquiry.getCreatedAt()),
                guided ? EnumHumanizer.humanize(enquiry.getSolutionModel()) : EnumHumanizer.humanize(enquiry.getProjectType()),
                enquiry.getName(),
                enquiry.getBusinessEmail(),
                enquiry.getPhone(),
                enquiry.getCountry(),
                enquiry.getCompanyName(),
                enquiry.getRole(),
                EnumHumanizer.humanize(enquiry.getPreferredContactMethod()),
                EnumHumanizer.humanize(enquiry.getPreferredContactTime()),
                preferredIsPhone,
                preferredIsWhatsapp,
                whatsappConsent,
                guided ? EnumHumanizer.humanize(enquiry.getEngagementModel()) : EnumHumanizer.humanize(enquiry.getServiceType()),
                EnumHumanizer.humanize(enquiry.getProjectStage()),
                productTypes,
                guided ? EnumHumanizer.humanize(enquiry.getGuidedTimeline()) : EnumHumanizer.humanize(enquiry.getTimeline()),
                guided ? EnumHumanizer.humanize(enquiry.getGuidedBudgetRange()) : EnumHumanizer.humanize(enquiry.getBudgetRange()),
                problemSource,
                existingSystemNote,
                enquiry.getSourceContext(),
                enquiry.getSourcePage(),
                enquiry.getUtmSource(),
                enquiry.getUtmCampaign());
    }

    private static String truncate(String text) {
        if (text == null) {
            return null;
        }
        String trimmed = text.trim();
        if (trimmed.length() <= PROBLEM_PREVIEW_MAX_CHARS) {
            return trimmed.isEmpty() ? null : trimmed;
        }
        return trimmed.substring(0, PROBLEM_PREVIEW_MAX_CHARS).trim() + "…";
    }
}
