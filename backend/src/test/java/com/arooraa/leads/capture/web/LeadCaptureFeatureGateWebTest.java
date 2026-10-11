package com.arooraa.leads.capture.web;

import com.arooraa.leads.capture.service.LeadCaptureService;
import com.arooraa.leads.service.ClientIpResolver;
import com.arooraa.leads.service.IpHasher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = LeadCaptureController.class, properties = "arooraa.lead-capture.enabled=false")
class LeadCaptureFeatureGateWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LeadCaptureService service;

    @MockitoBean
    private ClientIpResolver clientIpResolver;

    @MockitoBean
    private IpHasher ipHasher;

    @Test
    void disabledEndpointAnswers404AndAcceptsNothing() throws Exception {
        mockMvc.perform(post("/api/v1/lead-captures").contentType(MediaType.APPLICATION_JSON)
                        .content(LeadCaptureControllerWebTest.VALID_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
        verify(service, never()).submit(any(), any(), nullable(String.class));
    }

    @Test
    void disabledEndpointDoesNotRevealItsContractThroughValidationErrors() throws Exception {
        mockMvc.perform(post("/api/v1/lead-captures").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.fieldErrors").isEmpty());
    }
}
