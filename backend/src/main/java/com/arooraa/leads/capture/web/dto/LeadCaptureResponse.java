package com.arooraa.leads.capture.web.dto;

/** Only the opaque reference — never the phone number, a database id or any other stored field. */
public record LeadCaptureResponse(String leadReference) {
}
