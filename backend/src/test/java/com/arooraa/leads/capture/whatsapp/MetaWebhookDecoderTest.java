package com.arooraa.leads.capture.whatsapp;

import com.arooraa.leads.capture.whatsapp.MetaWebhookDecoder.Decoded;
import com.arooraa.leads.capture.whatsapp.MetaWebhookDecoder.MalformedWebhookException;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static com.arooraa.leads.capture.whatsapp.WhatsAppFixtures.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MetaWebhookDecoderTest {

    private static final Instant NOW = Instant.parse("2026-10-12T06:00:00Z");
    private final MetaWebhookDecoder decoder = new MetaWebhookDecoder(JsonMapper.builder().build(), WABA_ID,
            PHONE_NUMBER_ID, Clock.fixed(NOW, ZoneOffset.UTC));

    private Decoded decode(String json) {
        return decoder.decode(json.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void decodesEnglishAndTamilTextWithE164SenderAndSourceTimestamp() {
        Decoded d = decode(message(
                "{\"from\":\"919876543210\",\"id\":\"wamid.EN1\",\"timestamp\":\"" + NOW.minusSeconds(60).getEpochSecond()
                        + "\",\"type\":\"text\",\"text\":{\"body\":\"Hello\"}}",
                "{\"from\":\"919876543211\",\"id\":\"wamid.TA1\",\"timestamp\":" + NOW.getEpochSecond()
                        + ",\"type\":\"text\",\"text\":{\"body\":\"வணக்கம்\"}}"));
        assertEquals(2, d.messages().size());
        assertEquals("+919876543210", d.messages().get(0).participantPhone());
        assertEquals("Hello", d.messages().get(0).text());
        assertEquals(NOW.minusSeconds(60), d.messages().get(0).sourceTimestamp());
        assertEquals("வணக்கம்", d.messages().get(1).text());
    }

    @Test
    void interactiveTitlesAreTextButMediaAndOverlongTextAreIgnored() {
        long ts = NOW.getEpochSecond();
        Decoded d = decode(message(
                "{\"from\":\"919876543210\",\"id\":\"wamid.B1\",\"timestamp\":\"" + ts
                        + "\",\"type\":\"interactive\",\"interactive\":{\"type\":\"button_reply\",\"button_reply\":{\"id\":\"x\",\"title\":\"English\"}}}",
                "{\"from\":\"919876543210\",\"id\":\"wamid.L1\",\"timestamp\":\"" + ts
                        + "\",\"type\":\"interactive\",\"interactive\":{\"type\":\"list_reply\",\"list_reply\":{\"id\":\"y\",\"title\":\"2\"}}}",
                "{\"from\":\"919876543210\",\"id\":\"wamid.I1\",\"timestamp\":\"" + ts + "\",\"type\":\"image\",\"image\":{\"id\":\"m\"}}",
                "{\"from\":\"919876543210\",\"id\":\"wamid.T1\",\"timestamp\":\"" + ts + "\",\"type\":\"text\",\"text\":{\"body\":\""
                        + "a".repeat(2001) + "\"}}"));
        assertEquals(2, d.messages().size());
        assertEquals("English", d.messages().get(0).text());
        assertEquals("2", d.messages().get(1).text());
        assertEquals(2, d.ignored());
    }

    @Test
    void otherAccountOtherNumberAndOtherObjectProduceNothing() {
        String foreignWaba = envelope("999999999999", PHONE_NUMBER_ID,
                "\"messages\":[{\"from\":\"919876543210\",\"id\":\"wamid.X\",\"timestamp\":\"1\",\"type\":\"text\",\"text\":{\"body\":\"x\"}}]");
        String foreignNumber = envelope(WABA_ID, "999999999999",
                "\"messages\":[{\"from\":\"919876543210\",\"id\":\"wamid.X\",\"timestamp\":\"1\",\"type\":\"text\",\"text\":{\"body\":\"x\"}}]");
        assertTrue(decode(foreignWaba).isEmpty());
        assertTrue(decode(foreignNumber).isEmpty());
        assertTrue(decode("{\"object\":\"page\",\"entry\":[]}").isEmpty());
    }

    @Test
    void anInvalidSiblingRejectsTheWholePayload() {
        long ts = NOW.getEpochSecond();
        String good = "{\"from\":\"919876543210\",\"id\":\"wamid.G\",\"timestamp\":\"" + ts + "\",\"type\":\"text\",\"text\":{\"body\":\"hi\"}}";
        for (String bad : new String[]{
                "{\"from\":\"0919876543210\",\"id\":\"wamid.B\",\"timestamp\":\"" + ts + "\",\"type\":\"text\",\"text\":{\"body\":\"hi\"}}",
                "{\"from\":\"+919876543210\",\"id\":\"wamid.B\",\"timestamp\":\"" + ts + "\",\"type\":\"text\",\"text\":{\"body\":\"hi\"}}",
                "{\"from\":\"1234567\",\"id\":\"wamid.B\",\"timestamp\":\"" + ts + "\",\"type\":\"text\",\"text\":{\"body\":\"hi\"}}",
                "{\"from\":\"919876543210\",\"timestamp\":\"" + ts + "\",\"type\":\"text\",\"text\":{\"body\":\"hi\"}}",
                "{\"from\":\"919876543210\",\"id\":\"" + "w".repeat(201) + "\",\"timestamp\":\"" + ts + "\",\"type\":\"text\",\"text\":{\"body\":\"hi\"}}",
                "{\"from\":\"919876543210\",\"id\":\"wamid.B\",\"timestamp\":\"" + (ts + 301) + "\",\"type\":\"text\",\"text\":{\"body\":\"hi\"}}",
                "{\"from\":\"919876543210\",\"id\":\"wamid.B\",\"timestamp\":\"soon\",\"type\":\"text\",\"text\":{\"body\":\"hi\"}}",
                "{\"from\":\"919876543210\",\"id\":\"wamid.B\",\"timestamp\":\"" + ts + "\",\"type\":\"text\"}"}) {
            assertThrows(MalformedWebhookException.class, () -> decode(message(good, bad)), bad);
        }
    }

    @Test
    void timestampWithinFiveMinutesOfSkewIsAccepted() {
        Instant at = NOW.plus(Duration.ofMinutes(5));
        assertEquals(at, decode(text("wamid.S", "919876543210", "hi", at)).messages().getFirst().sourceTimestamp());
    }

    @Test
    void malformedJsonAndMissingEntryAreRejected() {
        assertThrows(MalformedWebhookException.class, () -> decode("{not json"));
        assertThrows(MalformedWebhookException.class, () -> decode("[]"));
        assertThrows(MalformedWebhookException.class, () -> decode("{\"object\":\"whatsapp_business_account\"}"));
    }

    @Test
    void arraysAreBounded() {
        String one = "{\"from\":\"919876543210\",\"id\":\"wamid.%d\",\"timestamp\":\"" + NOW.getEpochSecond()
                + "\",\"type\":\"text\",\"text\":{\"body\":\"hi\"}}";
        String[] many = new String[MetaWebhookDecoder.MAX_ITEMS_PER_CHANGE + 1];
        for (int i = 0; i < many.length; i++) many[i] = one.formatted(i);
        assertThrows(MalformedWebhookException.class, () -> decode(message(many)));
    }

    @Test
    void statusesKeepCallbackIdAndUnknownStatusesAreIgnored() {
        UUID cb = UUID.randomUUID();
        Decoded d = decode(status("wamid.OUT", "919876543210", "delivered", cb.toString(), NOW));
        assertEquals(1, d.statuses().size());
        assertEquals(cb, d.statuses().getFirst().callbackId());
        assertEquals("delivered", d.statuses().getFirst().status());

        assertNull(decode(status("wamid.OUT", "919876543210", "read", "not-a-uuid", NOW)).statuses().getFirst().callbackId());
        Decoded unknown = decode(status("wamid.OUT", "919876543210", "deleted", null, NOW));
        assertTrue(unknown.isEmpty());
        assertEquals(1, unknown.ignored());
        assertThrows(MalformedWebhookException.class,
                () -> decode(status("wamid.OUT", "abc", "sent", null, NOW)));
    }
}
