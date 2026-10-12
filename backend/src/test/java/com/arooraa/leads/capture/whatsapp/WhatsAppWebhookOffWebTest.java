package com.arooraa.leads.capture.whatsapp;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static com.arooraa.leads.capture.whatsapp.WhatsAppFixtures.sign;
import static com.arooraa.leads.capture.whatsapp.WhatsAppFixtures.text;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Default configuration: everything off, no credentials needed, every request is a plain 404. */
@WebMvcTest(WhatsAppWebhookController.class)
@Import(WhatsAppConfiguration.class)
class WhatsAppWebhookOffWebTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    WhatsAppInbox inbox;

    @Test
    void disabledWebhookAnswers404ForGetAndSignedPost() throws Exception {
        mockMvc.perform(get(WhatsAppWebhookWebTest.PATH).param("hub.mode", "subscribe")
                .param("hub.verify_token", "anything-anything-anything").param("hub.challenge", "1"))
                .andExpect(status().isNotFound());
        String body = text("wamid.A", "919876543210", "Hello", Instant.now());
        mockMvc.perform(post(WhatsAppWebhookWebTest.PATH).contentType(MediaType.APPLICATION_JSON).content(body)
                        .header("X-Hub-Signature-256", sign(body)))
                .andExpect(status().isNotFound());
        verify(inbox, never()).accept(any());
    }
}
