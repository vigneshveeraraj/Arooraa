package com.arooraa.leads.capture.whatsapp;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;

/** Synthetic, non-secret Meta webhook fixtures — test values only, never real credentials. */
final class WhatsAppFixtures {

    static final String APP_SECRET = "test-app-secret-0123456789abcdef";
    static final String VERIFY_TOKEN = "test-verify-token-0123456789-abcdef";
    static final String ACCESS_TOKEN = "test-access-token-not-real-0123456789";
    static final String WABA_ID = "100000000000001";
    static final String PHONE_NUMBER_ID = "200000000000002";
    static final String API_VERSION = "v99.0";

    private WhatsAppFixtures() {
    }

    static String text(String wamid, String fromDigits, String body, Instant at) {
        return message("""
                {"from":"%s","id":"%s","timestamp":"%d","type":"text","text":{"body":%s}}
                """.formatted(fromDigits, wamid, at.getEpochSecond(), quote(body)));
    }

    static String message(String... messageJson) {
        return envelope(WABA_ID, PHONE_NUMBER_ID, "\"messages\":[" + String.join(",", messageJson) + "]");
    }

    static String status(String wamid, String recipient, String status, String callback, Instant at) {
        String cb = callback == null ? "" : ",\"biz_opaque_callback_data\":\"" + callback + "\"";
        return envelope(WABA_ID, PHONE_NUMBER_ID, """
                "statuses":[{"id":"%s","status":"%s","timestamp":"%d","recipient_id":"%s"%s}]
                """.formatted(wamid, status, at.getEpochSecond(), recipient, cb));
    }

    static String envelope(String wabaId, String phoneNumberId, String valueFields) {
        return """
                {"object":"whatsapp_business_account","entry":[{"id":"%s","changes":[{"field":"messages",
                 "value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"0","phone_number_id":"%s"},
                 "contacts":[{"profile":{"name":"IGNORED"},"wa_id":"0"}],%s}}]}]}
                """.formatted(wabaId, phoneNumberId, valueFields);
    }

    static String sign(byte[] body) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(APP_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return "sha256=" + HexFormat.of().formatHex(mac.doFinal(body));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    static String sign(String body) {
        return sign(body.getBytes(StandardCharsets.UTF_8));
    }

    private static String quote(String s) {
        StringBuilder out = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> out.append("\\\"");
                case '\\' -> out.append("\\\\");
                case '\n' -> out.append("\\n");
                default -> out.append(c);
            }
        }
        return out.append('"').toString();
    }
}
