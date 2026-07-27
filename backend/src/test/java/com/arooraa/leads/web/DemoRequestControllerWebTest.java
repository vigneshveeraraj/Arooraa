package com.arooraa.leads.web;

import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.service.ClientIpResolver;
import com.arooraa.leads.service.DemoRequestService;
import com.arooraa.leads.service.IpHasher;
import com.arooraa.leads.service.SubmitOutcome;
import com.arooraa.leads.web.dto.DemoRequestResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DemoRequestController.class)
class DemoRequestControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DemoRequestService demoRequestService;

    @MockitoBean
    private ClientIpResolver clientIpResolver;

    @MockitoBean
    private IpHasher ipHasher;

    private static final String VALID_JSON = """
            {
              "contactName": "Priya Sharma",
              "restaurantName": "Spice Route",
              "whatsappNumber": "9876543210",
              "city": "Chennai",
              "outletCount": "ONE",
              "restaurantType": "CASUAL_DINING",
              "primaryChallenge": "BILLING_POS"
            }
            """;

    private void stubIpResolution() {
        when(clientIpResolver.resolve(any(HttpServletRequest.class))).thenReturn("203.0.113.5");
        when(ipHasher.hash(anyString())).thenReturn("deadbeefcafebabe");
    }

    @Test
    void acceptedRequestReturns201WithReceivedStatus() throws Exception {
        stubIpResolution();
        UUID id = UUID.randomUUID();
        when(demoRequestService.submit(any(), anyString(), any())).thenReturn(
                new SubmitOutcome.Created(new DemoRequestResponse(id, DemoRequestResponse.STATUS_RECEIVED,
                        DemoRequestResponse.DEFAULT_MESSAGE)));

        mockMvc.perform(post("/api/v1/demo-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestId").value(id.toString()))
                .andExpect(jsonPath("$.status").value("RECEIVED"));
    }

    @Test
    void duplicateRequestReturns200WithAlreadyReceivedStatus() throws Exception {
        stubIpResolution();
        UUID id = UUID.randomUUID();
        when(demoRequestService.submit(any(), anyString(), any())).thenReturn(
                new SubmitOutcome.DuplicateDetected(new DemoRequestResponse(id,
                        DemoRequestResponse.STATUS_ALREADY_RECEIVED, DemoRequestResponse.ALREADY_RECEIVED_MESSAGE)));

        mockMvc.perform(post("/api/v1/demo-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ALREADY_RECEIVED"));
    }

    @Test
    void rateLimitedRequestReturns429() throws Exception {
        stubIpResolution();
        when(demoRequestService.submit(any(), anyString(), any())).thenThrow(new RateLimitExceededException());

        mockMvc.perform(post("/api/v1/demo-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"));
    }

    @Test
    void missingRequiredFieldReturns400ValidationError() throws Exception {
        String missingContactName = """
                {
                  "restaurantName": "Spice Route",
                  "whatsappNumber": "9876543210",
                  "city": "Chennai",
                  "outletCount": "ONE",
                  "restaurantType": "CASUAL_DINING",
                  "primaryChallenge": "BILLING_POS"
                }
                """;

        mockMvc.perform(post("/api/v1/demo-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(missingContactName))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.contactName").exists());
    }

    @Test
    void invalidEnumValueReturns400ValidationErrorWithoutExposingInternals() throws Exception {
        String invalidEnumJson = """
                {
                  "contactName": "Priya Sharma",
                  "restaurantName": "Spice Route",
                  "whatsappNumber": "9876543210",
                  "city": "Chennai",
                  "outletCount": "ONE",
                  "restaurantType": "NOT_A_REAL_TYPE",
                  "primaryChallenge": "BILLING_POS"
                }
                """;

        mockMvc.perform(post("/api/v1/demo-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidEnumJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(content().string(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("com.arooraa.leads"))));
    }

    @Test
    void unexpectedFailureReturns500WithoutLeakingDetails() throws Exception {
        stubIpResolution();
        when(demoRequestService.submit(any(), anyString(), any()))
                .thenThrow(new RuntimeException("Connection to jdbc:postgresql://internal-host failed"));

        mockMvc.perform(post("/api/v1/demo-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(content().string(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("jdbc:postgresql"))));
    }

    @Test
    void honeypotFieldRejectsSubmission() throws Exception {
        String honeypotJson = """
                {
                  "contactName": "Priya Sharma",
                  "restaurantName": "Spice Route",
                  "whatsappNumber": "9876543210",
                  "city": "Chennai",
                  "outletCount": "ONE",
                  "restaurantType": "CASUAL_DINING",
                  "primaryChallenge": "BILLING_POS",
                  "website": "http://spam.example"
                }
                """;

        mockMvc.perform(post("/api/v1/demo-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(honeypotJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
