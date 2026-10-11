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

@WebMvcTest(LeadConversationSimulatorController.class)
class LeadConversationSimulatorOffWebTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    LeadConversationService service;

    @Test
    void answers404EvenWithAToken() throws Exception {
        mockMvc.perform(post("/api/v1/lead-conversations/simulator/messages").header("X-Simulator-Token", LeadConversationSimulatorWebTest.TOKEN)
                        .contentType(MediaType.APPLICATION_JSON).content(LeadConversationSimulatorWebTest.BODY))
                .andExpect(status().isNotFound());
        verify(service, never()).handle(any());
    }
}
