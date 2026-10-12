package com.arooraa.leads.capture.whatsapp;

import com.arooraa.leads.capture.whatsapp.MetaWebhookDecoder.Decoded;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;

import static com.arooraa.leads.capture.whatsapp.WhatsAppFixtures.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WhatsAppWebhookController.class, properties = {
        "arooraa.whatsapp.enabled=true",
        "arooraa.whatsapp.app-secret=" + APP_SECRET,
        "arooraa.whatsapp.verify-token=" + VERIFY_TOKEN,
        "arooraa.whatsapp.phone-number-id=" + PHONE_NUMBER_ID,
        "arooraa.whatsapp.business-account-id=" + WABA_ID})
@Import(WhatsAppConfiguration.class)
class WhatsAppWebhookWebTest {

    static final String PATH = "/api/v1/whatsapp/webhook";

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    WhatsAppInbox inbox;

    private org.springframework.test.web.servlet.ResultActions postSigned(String body, String signature) throws Exception {
        var request = post(PATH).contentType(MediaType.APPLICATION_JSON).content(body.getBytes(StandardCharsets.UTF_8));
        if (signature != null) {
            request.header("X-Hub-Signature-256", signature);
        }
        return mockMvc.perform(request);
    }

    @Test
    void challengeIsEchoedAsPlainTextOnlyForSubscribeWithTheVerifyToken() throws Exception {
        mockMvc.perform(get(PATH).param("hub.mode", "subscribe").param("hub.verify_token", VERIFY_TOKEN)
                        .param("hub.challenge", "1158201444"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string("1158201444"));
        mockMvc.perform(get(PATH).param("hub.mode", "subscribe").param("hub.verify_token", VERIFY_TOKEN + "x")
                        .param("hub.challenge", "1")).andExpect(status().isForbidden());
        mockMvc.perform(get(PATH).param("hub.mode", "unsubscribe").param("hub.verify_token", VERIFY_TOKEN)
                        .param("hub.challenge", "1")).andExpect(status().isForbidden());
        mockMvc.perform(get(PATH).param("hub.mode", "subscribe").param("hub.verify_token", APP_SECRET)
                        .param("hub.challenge", "1")).andExpect(status().isForbidden());
        mockMvc.perform(get(PATH).param("hub.mode", "subscribe")).andExpect(status().isBadRequest());
        mockMvc.perform(get(PATH).param("hub.mode", "subscribe").param("hub.verify_token", VERIFY_TOKEN)
                        .param("hub.challenge", "<script>")).andExpect(status().isBadRequest());
    }

    @Test
    void missingWrongOrTamperedSignatureIs401AndNothingIsWritten() throws Exception {
        String body = text("wamid.A", "919876543210", "Hello", Instant.now());
        postSigned(body, null).andExpect(status().isUnauthorized()).andExpect(content().string(""));
        postSigned(body, "sha256=" + "0".repeat(64)).andExpect(status().isUnauthorized());
        postSigned(body.replace("Hello", "Hellx"), sign(body)).andExpect(status().isUnauthorized());
        postSigned(body, sign(body).toUpperCase().replace("SHA256=", "sha1=")).andExpect(status().isUnauthorized());
        verify(inbox, never()).accept(any());
    }

    @Test
    void oversizedBodyIs413EvenWhenSignedAndNothingIsWritten() throws Exception {
        byte[] big = new byte[WhatsAppWebhookController.MAX_BODY_BYTES + 1];
        Arrays.fill(big, (byte) ' ');
        mockMvc.perform(post(PATH).contentType(MediaType.APPLICATION_JSON).content(big)
                        .header("X-Hub-Signature-256", sign(big)))
                .andExpect(status().is(413));
        verify(inbox, never()).accept(any());
    }

    @Test
    void malformedSignedJsonIs400WithoutEchoingThePayload() throws Exception {
        String body = "{\"object\":\"whatsapp_business_account\",\"entry\":\"SECRET-ECHO-CHECK\"";
        postSigned(body, sign(body)).andExpect(status().isBadRequest()).andExpect(content().string(""));
        verify(inbox, never()).accept(any());
    }

    @Test
    void signedEnglishAndTamilMessagesAreHandedToTheInbox() throws Exception {
        Instant now = Instant.now();
        String body = message(
                "{\"from\":\"919876543210\",\"id\":\"wamid.EN\",\"timestamp\":\"" + now.getEpochSecond()
                        + "\",\"type\":\"text\",\"text\":{\"body\":\"Hi, I need a website\"}}",
                "{\"from\":\"919876543211\",\"id\":\"wamid.TA\",\"timestamp\":\"" + now.getEpochSecond()
                        + "\",\"type\":\"text\",\"text\":{\"body\":\"வணக்கம், இணையதளம் வேண்டும்\"}}");
        postSigned(body, sign(body)).andExpect(status().isOk());

        ArgumentCaptor<Decoded> captor = ArgumentCaptor.forClass(Decoded.class);
        verify(inbox).accept(captor.capture());
        assertEquals("Hi, I need a website", captor.getValue().messages().get(0).text());
        assertEquals("வணக்கம், இணையதளம் வேண்டும்", captor.getValue().messages().get(1).text());
        assertEquals("+919876543211", captor.getValue().messages().get(1).participantPhone());
    }

    @Test
    void otherAccountAndUnsupportedEventsAreAcknowledgedWithoutWrites() throws Exception {
        String foreign = envelope("999999999999", PHONE_NUMBER_ID,
                "\"messages\":[{\"from\":\"919876543210\",\"id\":\"wamid.F\",\"timestamp\":\"1\",\"type\":\"text\",\"text\":{\"body\":\"x\"}}]");
        postSigned(foreign, sign(foreign)).andExpect(status().isOk());
        String image = message("{\"from\":\"919876543210\",\"id\":\"wamid.I\",\"timestamp\":\""
                + Instant.now().getEpochSecond() + "\",\"type\":\"image\",\"image\":{\"id\":\"1\"}}");
        postSigned(image, sign(image)).andExpect(status().isOk());
        String unknownStatus = WhatsAppFixtures.status("wamid.O", "919876543210", "deleted", null, Instant.now());
        postSigned(unknownStatus, sign(unknownStatus)).andExpect(status().isOk());
        verify(inbox, never()).accept(any());
    }

    @Test
    void signedStatusesAreHandedToTheInbox() throws Exception {
        String body = WhatsAppFixtures.status("wamid.O", "919876543210", "delivered", null, Instant.now());
        postSigned(body, sign(body)).andExpect(status().isOk());
        verify(inbox).accept(any());
    }
}
