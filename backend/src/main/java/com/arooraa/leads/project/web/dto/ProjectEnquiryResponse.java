package com.arooraa.leads.project.web.dto;

import java.util.UUID;

public record ProjectEnquiryResponse(
        UUID enquiryId,
        String enquiryNumber,
        String status,
        String message
) {
    public static final String STATUS_RECEIVED = "RECEIVED";
    public static final String STATUS_ALREADY_RECEIVED = "ALREADY_RECEIVED";

    public static final String DEFAULT_MESSAGE =
            "Your project enquiry has been received. We'll review your requirement and contact you using your preferred contact method.";
    public static final String ALREADY_RECEIVED_MESSAGE =
            "We already received this enquiry. Our team will contact you using your preferred contact method.";
}
