package com.arooraa.leads.project.web;

import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.project.exception.IdempotencyConflictException;
import com.arooraa.leads.project.service.ProjectEnquiryService;
import com.arooraa.leads.project.service.ProjectEnquirySubmitOutcome;
import com.arooraa.leads.project.web.dto.ProjectEnquiryResponse;
import com.arooraa.leads.service.ClientIpResolver;
import com.arooraa.leads.service.IpHasher;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProjectEnquiryController.class)
class ProjectEnquiryControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProjectEnquiryService projectEnquiryService;

    @MockitoBean
    private ClientIpResolver clientIpResolver;

    @MockitoBean
    private IpHasher ipHasher;

    private static final String VALID_JSON = """
            {
              "name": "Arun Kumar",
              "companyName": "ABC Logistics",
              "businessEmail": "arun@example.com",
              "phone": "+919876543210",
              "country": "India",
              "serviceType": "CUSTOM_SOFTWARE",
              "projectType": "NEW_PRODUCT",
              "description": "We need a logistics tracking platform for our operations across five cities.",
              "existingSystem": false,
              "budgetRange": "FROM_2L_TO_5L",
              "timeline": "FROM_1_TO_3_MONTHS",
              "preferredContactMethod": "PHONE",
              "source": "WEBSITE",
              "sourcePage": "/start-project"
            }
            """;

    private void stubIpResolution() {
        when(clientIpResolver.resolve(any(HttpServletRequest.class))).thenReturn("203.0.113.5");
        when(ipHasher.hash(anyString())).thenReturn("deadbeefcafebabe");
    }

    @Test
    void acceptedEnquiryReturns201WithReceivedStatus() throws Exception {
        stubIpResolution();
        UUID id = UUID.randomUUID();
        when(projectEnquiryService.submit(any(), anyString(), any(), nullable(String.class))).thenReturn(
                new ProjectEnquirySubmitOutcome.Created(new ProjectEnquiryResponse(id, "ARO-2026-000001",
                        ProjectEnquiryResponse.STATUS_RECEIVED, ProjectEnquiryResponse.DEFAULT_MESSAGE)));

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.enquiryId").value(id.toString()))
                .andExpect(jsonPath("$.enquiryNumber").value("ARO-2026-000001"))
                .andExpect(jsonPath("$.status").value("RECEIVED"));
    }

    @Test
    void duplicateEnquiryReturns200WithAlreadyReceivedStatus() throws Exception {
        stubIpResolution();
        UUID id = UUID.randomUUID();
        when(projectEnquiryService.submit(any(), anyString(), any(), nullable(String.class))).thenReturn(
                new ProjectEnquirySubmitOutcome.DuplicateDetected(new ProjectEnquiryResponse(id, "ARO-2026-000001",
                        ProjectEnquiryResponse.STATUS_ALREADY_RECEIVED, ProjectEnquiryResponse.ALREADY_RECEIVED_MESSAGE)));

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ALREADY_RECEIVED"));
    }

    @Test
    void rateLimitedEnquiryReturns429() throws Exception {
        stubIpResolution();
        when(projectEnquiryService.submit(any(), anyString(), any(), nullable(String.class)))
                .thenThrow(new RateLimitExceededException());

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"));
    }

    @Test
    void missingRequiredFieldReturns400ValidationError() throws Exception {
        String missingName = """
                {
                  "businessEmail": "arun@example.com",
                  "phone": "+919876543210",
                  "country": "India",
                  "serviceType": "CUSTOM_SOFTWARE",
                  "projectType": "NEW_PRODUCT",
                  "description": "We need a logistics tracking platform for our operations across five cities.",
                  "existingSystem": false,
                  "budgetRange": "FROM_2L_TO_5L",
                  "timeline": "FROM_1_TO_3_MONTHS",
                  "preferredContactMethod": "PHONE"
                }
                """;

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(missingName))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test
    void invalidEnumValueReturns400ValidationErrorWithoutExposingInternals() throws Exception {
        String invalidEnumJson = """
                {
                  "name": "Arun Kumar",
                  "businessEmail": "arun@example.com",
                  "phone": "+919876543210",
                  "country": "India",
                  "serviceType": "NOT_A_REAL_SERVICE",
                  "projectType": "NEW_PRODUCT",
                  "description": "We need a logistics tracking platform for our operations across five cities.",
                  "existingSystem": false,
                  "budgetRange": "FROM_2L_TO_5L",
                  "timeline": "FROM_1_TO_3_MONTHS",
                  "preferredContactMethod": "PHONE"
                }
                """;

        mockMvc.perform(post("/api/v1/project-enquiries")
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
        when(projectEnquiryService.submit(any(), anyString(), any(), nullable(String.class)))
                .thenThrow(new RuntimeException("Connection to jdbc:postgresql://internal-host failed"));

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(content().string(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("jdbc:postgresql"))));
    }

    private static final String VALID_GUIDED_JSON = """
            {
              "submissionVersion": "GUIDED",
              "name": "Priya Nair",
              "companyName": "Nair Foods",
              "businessEmail": "priya@example.com",
              "phone": "+919876500200",
              "country": "India",
              "countryCode": "IN",
              "solutionModel": "NEW_PRODUCT",
              "engagementModel": "DESIGN_BUILD",
              "problemStatement": "We want to launch a new customer ordering app for our restaurant chain.",
              "projectStage": "IDEA",
              "productTypes": ["MOBILE_APPLICATION"],
              "guidedTimeline": "WITHIN_1_TO_3_MONTHS",
              "guidedBudgetRange": "UNDER_5L",
              "preferredContactMethod": "EMAIL",
              "whatsappConsent": true,
              "source": "WEBSITE",
              "sourcePage": "/start-project"
            }
            """;

    @Test
    void guidedEnquiryReturns201WithReceivedStatus() throws Exception {
        stubIpResolution();
        UUID id = UUID.randomUUID();
        when(projectEnquiryService.submit(any(), anyString(), any(), nullable(String.class))).thenReturn(
                new ProjectEnquirySubmitOutcome.Created(new ProjectEnquiryResponse(id, "ARO-2026-000002",
                        ProjectEnquiryResponse.STATUS_RECEIVED, ProjectEnquiryResponse.DEFAULT_MESSAGE)));

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Idempotency-Key", "client-generated-key-1")
                        .content(VALID_GUIDED_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.enquiryNumber").value("ARO-2026-000002"));
    }

    @Test
    void idempotencyKeyHeaderIsPassedThroughToTheService() throws Exception {
        stubIpResolution();
        UUID id = UUID.randomUUID();
        when(projectEnquiryService.submit(any(), anyString(), any(), nullable(String.class))).thenReturn(
                new ProjectEnquirySubmitOutcome.Created(new ProjectEnquiryResponse(id, "ARO-2026-000002",
                        ProjectEnquiryResponse.STATUS_RECEIVED, ProjectEnquiryResponse.DEFAULT_MESSAGE)));

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Idempotency-Key", "client-generated-key-1")
                        .content(VALID_GUIDED_JSON))
                .andExpect(status().isCreated());

        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        verify(projectEnquiryService).submit(any(), anyString(), any(), keyCaptor.capture());
        org.junit.jupiter.api.Assertions.assertEquals("client-generated-key-1", keyCaptor.getValue());
    }

    @Test
    void missingIdempotencyKeyHeaderIsPassedAsNull() throws Exception {
        stubIpResolution();
        UUID id = UUID.randomUUID();
        when(projectEnquiryService.submit(any(), anyString(), any(), nullable(String.class))).thenReturn(
                new ProjectEnquirySubmitOutcome.Created(new ProjectEnquiryResponse(id, "ARO-2026-000001",
                        ProjectEnquiryResponse.STATUS_RECEIVED, ProjectEnquiryResponse.DEFAULT_MESSAGE)));

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON))
                .andExpect(status().isCreated());

        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        verify(projectEnquiryService).submit(any(), anyString(), any(), keyCaptor.capture());
        org.junit.jupiter.api.Assertions.assertNull(keyCaptor.getValue());
    }

    @Test
    void idempotencyConflictReturns409WithoutLeakingDetails() throws Exception {
        stubIpResolution();
        when(projectEnquiryService.submit(any(), anyString(), any(), nullable(String.class)))
                .thenThrow(new IdempotencyConflictException());

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Idempotency-Key", "reused-key")
                        .content(VALID_GUIDED_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDEMPOTENCY_CONFLICT"));
    }

    @Test
    void guidedEnquiryMissingSolutionModelReturns400ValidationError() throws Exception {
        String missingSolutionModel = """
                {
                  "submissionVersion": "GUIDED",
                  "name": "Priya Nair",
                  "businessEmail": "priya@example.com",
                  "phone": "+919876500200",
                  "country": "India",
                  "engagementModel": "DESIGN_BUILD",
                  "problemStatement": "We want to launch a new customer ordering app for our restaurant chain.",
                  "projectStage": "IDEA",
                  "productTypes": ["MOBILE_APPLICATION"],
                  "guidedTimeline": "WITHIN_1_TO_3_MONTHS",
                  "preferredContactMethod": "EMAIL"
                }
                """;

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(missingSolutionModel))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.solutionModel").exists());
    }

    @Test
    void honeypotFieldRejectsSubmission() throws Exception {
        String honeypotJson = """
                {
                  "name": "Arun Kumar",
                  "businessEmail": "arun@example.com",
                  "phone": "+919876543210",
                  "country": "India",
                  "serviceType": "CUSTOM_SOFTWARE",
                  "projectType": "NEW_PRODUCT",
                  "description": "We need a logistics tracking platform for our operations across five cities.",
                  "existingSystem": false,
                  "budgetRange": "FROM_2L_TO_5L",
                  "timeline": "FROM_1_TO_3_MONTHS",
                  "preferredContactMethod": "PHONE",
                  "website": "http://spam.example"
                }
                """;

        mockMvc.perform(post("/api/v1/project-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(honeypotJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
