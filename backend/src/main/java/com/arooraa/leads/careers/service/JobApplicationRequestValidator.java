package com.arooraa.leads.careers.service;

import com.arooraa.leads.careers.exception.RecruitmentValidationException;
import com.arooraa.leads.careers.web.dto.JobApplicationCreateRequest;
import com.arooraa.leads.project.service.InternationalPhoneNormalizer;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Server-side validation for the multipart application request (W3.3B §6) — the frontend
 * already validates the same fields, but a request that bypasses it entirely (a raw POST) must
 * be rejected here too, never trusted. Field-safe: every message is written to be shown
 * directly to a candidate, and this never rejects with a stack trace or internal detail.
 */
@Component
public class JobApplicationRequestValidator {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final int NAME_MAX = 100;
    private static final int LOCATION_MAX = 150;
    private static final int EXPERIENCE_MAX = 100;
    private static final int URL_MAX = 500;
    private static final int NOTE_MAX = 2000;

    public void validate(JobApplicationCreateRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();

        if (isBlank(request.jobSlug())) {
            errors.put("jobSlug", "A role must be selected.");
        }

        String name = request.fullName();
        if (isBlank(name)) {
            errors.put("fullName", "Enter your full name.");
        } else if (name.trim().length() > NAME_MAX) {
            errors.put("fullName", "Full name is too long.");
        }

        if (isBlank(request.email())) {
            errors.put("email", "Enter your email address.");
        } else if (!EMAIL_PATTERN.matcher(request.email().trim()).matches()) {
            errors.put("email", "Enter a valid email address.");
        }

        if (isBlank(request.phone())) {
            errors.put("phone", "Enter a phone number.");
        } else if (!InternationalPhoneNormalizer.isValid(request.phone())) {
            errors.put("phone", "Enter a valid phone number.");
        }

        if (request.currentLocation() != null && request.currentLocation().length() > LOCATION_MAX) {
            errors.put("currentLocation", "Current location is too long.");
        }
        if (request.experience() != null && request.experience().length() > EXPERIENCE_MAX) {
            errors.put("experience", "Experience is too long.");
        }
        if (!isBlankOrValidUrl(request.linkedinUrl())) {
            errors.put("linkedinUrl", "Enter a valid URL.");
        }
        if (!isBlankOrValidUrl(request.portfolioUrl())) {
            errors.put("portfolioUrl", "Enter a valid URL.");
        }
        if (request.note() != null && request.note().length() > NOTE_MAX) {
            errors.put("note", "Please keep this under " + NOTE_MAX + " characters.");
        }
        if (!request.recruitmentConsent()) {
            errors.put("recruitmentConsent", "Please confirm you consent to AROORAA using this information for recruitment.");
        }

        if (!errors.isEmpty()) {
            throw new RecruitmentValidationException(errors);
        }
    }

    private static boolean isBlankOrValidUrl(String value) {
        if (value == null || value.isBlank()) {
            return true;
        }
        if (value.length() > URL_MAX) {
            return false;
        }
        try {
            URI uri = new URI(value.trim());
            return uri.isAbsolute() && ("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()));
        } catch (URISyntaxException e) {
            return false;
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
