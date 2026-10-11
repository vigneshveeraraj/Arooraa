package com.arooraa.leads.capture.whatsapp;

import org.junit.jupiter.api.Test;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import static org.junit.jupiter.api.Assertions.*;

class MetaWebhookSignatureVerifierTest {
    private static final String SECRET = "test-meta-app-secret-with-sufficient-length";
    private static final byte[] BODY = "{\"entry\":[{\"changes\":[]}]}".getBytes(StandardCharsets.UTF_8);

    private static String signature(byte[] body) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return "sha256=" + HexFormat.of().formatHex(mac.doFinal(body));
    }

    @Test void validRawBodySignatureAccepted() throws Exception {
        assertTrue(MetaWebhookSignatureVerifier.verify(BODY, signature(BODY), SECRET));
    }

    @Test void modifiedBodyRejected() throws Exception {
        assertFalse(MetaWebhookSignatureVerifier.verify("changed".getBytes(StandardCharsets.UTF_8), signature(BODY), SECRET));
    }

    @Test void badSignatureOrAbsentSecretRejected() throws Exception {
        assertFalse(MetaWebhookSignatureVerifier.verify(BODY, null, SECRET));
        assertFalse(MetaWebhookSignatureVerifier.verify(BODY, signature(BODY), null));
        assertFalse(MetaWebhookSignatureVerifier.verify(BODY, signature(BODY), "short"));
        assertFalse(MetaWebhookSignatureVerifier.verify(BODY, "sha256=xyz", SECRET));
        assertFalse(MetaWebhookSignatureVerifier.verify(BODY, "sha1=" + "0".repeat(40), SECRET));
        assertFalse(MetaWebhookSignatureVerifier.verify(null, signature(BODY), SECRET));
    }

    @Test void replayedValidSignatureDoesNotAuthenticateDifferentBody() throws Exception {
        byte[] a = "{\"message\":\"a\"}".getBytes(StandardCharsets.UTF_8);
        byte[] b = "{\"message\":\"b\"}".getBytes(StandardCharsets.UTF_8);
        assertFalse(MetaWebhookSignatureVerifier.verify(b, signature(a), SECRET));
    }
}
