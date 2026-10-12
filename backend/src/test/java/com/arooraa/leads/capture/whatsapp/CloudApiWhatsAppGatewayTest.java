package com.arooraa.leads.capture.whatsapp;

import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.Accepted;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.RetryableNotAccepted;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.SendOutcome;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.Terminal;
import com.arooraa.leads.capture.whatsapp.WhatsAppGateway.Unknown;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import static com.arooraa.leads.capture.whatsapp.WhatsAppFixtures.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Response categories and request shape — no network: classify() and requestBody() are pure. */
class CloudApiWhatsAppGatewayTest {

    private final JsonMapper json = JsonMapper.builder().build();
    private final CloudApiWhatsAppGateway gateway = new CloudApiWhatsAppGateway(properties(true, true), json);

    static WhatsAppProperties properties(boolean enabled, boolean outbound) {
        return new WhatsAppProperties(enabled, outbound, APP_SECRET, VERIFY_TOKEN, ACCESS_TOKEN, PHONE_NUMBER_ID,
                WABA_ID, API_VERSION, 3000, 10000, new WhatsAppProperties.Worker(false, 2000, 20));
    }

    private SendOutcome classify(int status, String retryAfter, String body) {
        return gateway.classify(status, Optional.ofNullable(retryAfter), body.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void endpointIsAlwaysHttpsGraphFacebookAndRejectsPathInjection() {
        URI uri = CloudApiWhatsAppGateway.endpoint(API_VERSION, PHONE_NUMBER_ID);
        assertEquals("https", uri.getScheme());
        assertEquals("graph.facebook.com", uri.getHost());
        assertEquals("/v99.0/" + PHONE_NUMBER_ID + "/messages", uri.getPath());
        assertThrows(IllegalStateException.class, () -> CloudApiWhatsAppGateway.endpoint("v1.0/../x", PHONE_NUMBER_ID));
        assertThrows(IllegalStateException.class, () -> CloudApiWhatsAppGateway.endpoint(API_VERSION, "1@evil.example"));
    }

    @Test
    void requestBodyCarriesTheCorrelationIdAndDigitsOnly() {
        UUID id = UUID.randomUUID();
        JsonNode body = json.readTree(gateway.requestBody(id, "919876543210", "வணக்கம்"));
        assertEquals("whatsapp", body.path("messaging_product").asString());
        assertEquals("919876543210", body.path("to").asString());
        assertEquals("text", body.path("type").asString());
        assertEquals("வணக்கம்", body.path("text").path("body").asString());
        assertEquals(id.toString(), body.path("biz_opaque_callback_data").asString());
    }

    @Test
    void successWithMessageIdIsAcceptedAndWithoutIsUnknown() {
        assertEquals(new Accepted("wamid.OK1"), classify(200, null, "{\"messages\":[{\"id\":\"wamid.OK1\"}]}"));
        assertInstanceOf(Unknown.class, classify(200, null, "{}"));
        assertInstanceOf(Unknown.class, classify(200, null, "not json"));
    }

    @Test
    void http429AndThrottlingCodesAreRetryableWithBoundedRetryAfter() {
        RetryableNotAccepted r = (RetryableNotAccepted) classify(429, "30", "");
        assertEquals(Duration.ofSeconds(30), r.retryAfter());
        assertEquals(CloudApiWhatsAppGateway.MAX_RETRY_AFTER,
                ((RetryableNotAccepted) classify(429, "999999", "")).retryAfter());
        assertNull(((RetryableNotAccepted) classify(429, "Wed, 21 Oct 2026 07:28:00 GMT", "")).retryAfter());
        assertNull(((RetryableNotAccepted) classify(429, "-5", "")).retryAfter());
        assertInstanceOf(RetryableNotAccepted.class, classify(400, null, "{\"error\":{\"code\":130429}}"));
    }

    @Test
    void authAndOtherClientErrorsAreTerminalWithSanitisedCodes() {
        Terminal auth = (Terminal) classify(401, null, "{\"error\":{\"code\":190,\"message\":\"token EAAB... invalid\"}}");
        assertEquals("AUTH_META_190", auth.code());
        assertEquals("META_131047", ((Terminal) classify(400, null,
                "{\"error\":{\"code\":131047,\"message\":\"+919876543210 outside window\"}}")).code());
        assertEquals("HTTP_404", ((Terminal) classify(404, null, "")).code());
        assertInstanceOf(Terminal.class, classify(302, null, ""), "redirects are never followed");
    }

    @Test
    void serverErrorsAreUnknownNeverRetried() {
        assertEquals(new Unknown("HTTP_5XX"), classify(500, null, ""));
        assertEquals(new Unknown("HTTP_5XX"), classify(503, "1", ""));
    }

    @Test
    void propertiesFailClosedOnlyForEnabledSwitchesAndNeverPrintSecrets() {
        properties(false, false).validate();
        new WhatsAppProperties(false, false, "", "", "", "", "", "", 3000, 10000,
                new WhatsAppProperties.Worker(false, 2000, 20)).validate();
        properties(true, true).validate();
        assertThrows(IllegalStateException.class, () -> properties(false, true).validate());
        assertThrows(IllegalStateException.class, () -> new WhatsAppProperties(true, false, APP_SECRET, "short",
                "", PHONE_NUMBER_ID, WABA_ID, "", 3000, 10000, new WhatsAppProperties.Worker(false, 2000, 20)).validate());
        IllegalStateException noVersion = assertThrows(IllegalStateException.class, () -> new WhatsAppProperties(true,
                true, APP_SECRET, VERIFY_TOKEN, ACCESS_TOKEN, PHONE_NUMBER_ID, WABA_ID, "", 3000, 10000,
                new WhatsAppProperties.Worker(false, 2000, 20)).validate());
        assertTrue(noVersion.getMessage().contains("api-version"));
        assertFalse(noVersion.getMessage().contains(ACCESS_TOKEN));
        String printed = properties(true, true).toString();
        assertFalse(printed.contains(APP_SECRET) || printed.contains(ACCESS_TOKEN) || printed.contains(VERIFY_TOKEN));
    }
}
