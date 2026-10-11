package com.arooraa.leads.capture.web;

import com.arooraa.leads.capture.exception.LeadCaptureIdempotencyConflictException;
import com.arooraa.leads.capture.service.LeadCaptureService;
import com.arooraa.leads.capture.service.LeadCaptureSubmitOutcome;
import com.arooraa.leads.capture.web.dto.LeadCaptureCreateRequest;
import com.arooraa.leads.capture.web.dto.LeadCaptureResponse;
import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.service.ClientIpResolver;
import com.arooraa.leads.service.IpHasher;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LeadCaptureController.class)
class LeadCaptureControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LeadCaptureService service;

    @MockitoBean
    private ClientIpResolver clientIpResolver;

    @MockitoBean
    private IpHasher ipHasher;

    static final String VALID_JSON = """
            {
              "requirement": "WEBSITE",
              "phone": "+919876543210",
              "countryCode": "IN",
              "consent": true,
              "consentText": "I agree that AROORAA may contact me about this enquiry.",
              "sourceLocale": "ta",
              "source": "WEBSITE",
              "sourcePage": "/ta/grow-your-business",
              "utmCampaign": "tn-growth",
              "website": ""
            }
            """;

    @BeforeEach
    void stubIpResolution() {
        when(clientIpResolver.resolve(any(HttpServletRequest.class))).thenReturn("203.0.113.5");
        when(ipHasher.hash(anyString())).thenReturn("deadbeefcafebabe");
    }

    private void stubCreated() {
        when(service.submit(any(), anyString(), nullable(String.class)))
                .thenReturn(new LeadCaptureSubmitOutcome.Created(new LeadCaptureResponse("LC-7Q2M9X")));
    }

    private org.springframework.test.web.servlet.ResultActions postJson(String json) throws Exception {
        return mockMvc.perform(post("/api/v1/lead-captures").contentType(MediaType.APPLICATION_JSON).content(json));
    }

    @Test
    void savedLeadReturns201WithOnlyTheOpaqueReference() throws Exception {
        stubCreated();

        postJson(VALID_JSON)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.leadReference").value("LC-7Q2M9X"))
                .andExpect(jsonPath("$.phone").doesNotExist())
                .andExpect(jsonPath("$.id").doesNotExist());
    }

    @Test
    void passesTheIdempotencyKeyAndHashedIpToTheService() throws Exception {
        stubCreated();

        mockMvc.perform(post("/api/v1/lead-captures").contentType(MediaType.APPLICATION_JSON)
                        .header("Idempotency-Key", "abc-123").content(VALID_JSON))
                .andExpect(status().isCreated());

        ArgumentCaptor<LeadCaptureCreateRequest> captor = ArgumentCaptor.forClass(LeadCaptureCreateRequest.class);
        verify(service).submit(captor.capture(), eq("deadbeefcafebabe"), eq("abc-123"));
        assertEquals("/ta/grow-your-business", captor.getValue().sourcePage());
    }

    @Test
    void replayedLeadReturns200WithTheSameReference() throws Exception {
        when(service.submit(any(), anyString(), nullable(String.class)))
                .thenReturn(new LeadCaptureSubmitOutcome.DuplicateDetected(new LeadCaptureResponse("LC-7Q2M9X")));

        postJson(VALID_JSON)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leadReference").value("LC-7Q2M9X"));
    }

    @Test
    void rateLimitedReturns429() throws Exception {
        when(service.submit(any(), anyString(), nullable(String.class))).thenThrow(new RateLimitExceededException());

        postJson(VALID_JSON)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"));
    }

    @Test
    void reusedKeyWithDifferentBodyReturns409() throws Exception {
        when(service.submit(any(), anyString(), nullable(String.class)))
                .thenThrow(new LeadCaptureIdempotencyConflictException());

        postJson(VALID_JSON)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDEMPOTENCY_CONFLICT"));
    }

    @Test
    void consentFalseIsRejected() throws Exception {
        assertRejected(VALID_JSON.replace("\"consent\": true", "\"consent\": false"), "consent");
    }

    @Test
    void missingConsentIsRejected() throws Exception {
        assertRejected(VALID_JSON.replace("\"consent\": true,", ""), "consent");
    }

    @Test
    void missingConsentTextIsRejected() throws Exception {
        assertRejected(VALID_JSON.replace("\"consentText\": \"I agree that AROORAA may contact me about this enquiry.\",", ""),
                "consentText");
    }

    @Test
    void nonIndianOrInvalidMobileIsRejected() throws Exception {
        assertRejected(VALID_JSON.replace("+919876543210", "+14155550123"), "phone");
        assertRejected(VALID_JSON.replace("+919876543210", "12345"), "phone");
    }

    @Test
    void missingRequirementIsRejected() throws Exception {
        assertRejected(VALID_JSON.replace("\"requirement\": \"WEBSITE\",", ""), "requirement");
    }

    @Test
    void unsupportedLocaleIsRejected() throws Exception {
        assertRejected(VALID_JSON.replace("\"sourceLocale\": \"ta\"", "\"sourceLocale\": \"hi\""), "sourceLocale");
    }

    @Test
    void aBrowserCannotClaimTheLeadCameFromWhatsApp() throws Exception {
        assertRejected(VALID_JSON.replace("\"source\": \"WEBSITE\"", "\"source\": \"WHATSAPP\""), "source");
    }

    @Test
    void filledHoneypotIsRejected() throws Exception {
        assertRejected(VALID_JSON.replace("\"website\": \"\"", "\"website\": \"http://spam.example\""), "website");
    }

    @Test
    void unknownRequirementValueIsA400NotA500() throws Exception {
        postJson(VALID_JSON.replace("\"WEBSITE\",\n  \"phone\"", "\"PRICING\",\n  \"phone\""))
                .andExpect(status().isBadRequest());
        verify(service, never()).submit(any(), anyString(), nullable(String.class));
    }

    private void assertRejected(String json, String field) throws Exception {
        postJson(json)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors." + field).exists());
        verify(service, never()).submit(any(), anyString(), nullable(String.class));
    }
}
