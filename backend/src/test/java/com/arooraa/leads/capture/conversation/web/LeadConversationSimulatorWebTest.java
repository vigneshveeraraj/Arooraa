package com.arooraa.leads.capture.conversation.web;

import com.arooraa.leads.capture.conversation.LeadConversationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = LeadConversationSimulatorController.class,
        properties = {"arooraa.lead-conversation.simulator.enabled=true",
                "arooraa.lead-conversation.simulator.token=" + LeadConversationSimulatorWebTest.TOKEN})
class LeadConversationSimulatorWebTest {

    static final String TOKEN = "local-simulator-token-0123456789";
    static final String BODY = "{\"phone\":\"+919876543210\",\"text\":\"hello\"}";


    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    LeadConversationService service;

    @Test
    void withoutTheTokenEvenMalformedJsonIsA404() throws Exception {
        mockMvc.perform(post("/api/v1/lead-conversations/simulator/messages")
                        .contentType(MediaType.APPLICATION_JSON).content("{not json"))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/v1/lead-conversations/simulator/messages").header("X-Simulator-Token", TOKEN + "x")
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isNotFound());
        verify(service, never()).handle(any());
    }

    @Test
    void withTheTokenRunsTheConversation() throws Exception {
        when(service.handle(any())).thenReturn(new LeadConversationService.Result(false, "LC-7Q2M9X",
                List.of(new LeadConversationService.OutboundReply(null, null, "Welcome to AROORAA!"))));

        mockMvc.perform(post("/api/v1/lead-conversations/simulator/messages").header("X-Simulator-Token", TOKEN)
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leadReference").value("LC-7Q2M9X"))
                .andExpect(jsonPath("$.replies[0]").value("Welcome to AROORAA!"));
    }

    @Test
    void rejectsAnInvalidPhone() throws Exception {
        mockMvc.perform(post("/api/v1/lead-conversations/simulator/messages").header("X-Simulator-Token", TOKEN)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"phone\":\"12345\",\"text\":\"hi\"}"))
                .andExpect(status().isBadRequest());
        verify(service, never()).handle(any());
    }
}
