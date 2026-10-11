package com.arooraa.leads.capture.whatsapp;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Validates Meta's X-Hub-Signature-256 against the unmodified webhook request body.
 * Never accept unsigned payloads, an unset app secret, or a malformed signature.
 * Keep this independent of any live webhook endpoint or outbound transport.
 */
public final class MetaWebhookSignatureVerifier {
    private static final String PREFIX = "sha256=";
    private static final int SHA256_HEX_LENGTH = 64;

    private MetaWebhookSignatureVerifier() {}

    public static boolean verify(byte[] rawBody, String signatureHeader, String appSecret) {
        if (rawBody == null || signatureHeader == null || appSecret == null
                || appSecret.isBlank() || appSecret.length() < 16
                || !signatureHeader.startsWith(PREFIX)
                || signatureHeader.length() != PREFIX.length() + SHA256_HEX_LENGTH) {
            return false;
        }
        String hex = signatureHeader.substring(PREFIX.length());
        if (!hex.matches("[0-9a-fA-F]{64}")) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(appSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = mac.doFinal(rawBody);
            byte[] supplied = HexFormat.of().parseHex(hex);
            return MessageDigest.isEqual(expected, supplied);
        } catch (Exception exception) {
            return false;
        }
    }
}
