package com.arooraa.leads.capture.whatsapp;

import com.arooraa.leads.capture.exception.FeatureDisabledException;
import com.arooraa.leads.capture.whatsapp.MetaWebhookDecoder.Decoded;
import com.arooraa.leads.capture.whatsapp.MetaWebhookDecoder.MalformedWebhookException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.util.regex.Pattern;

/**
 * Meta WhatsApp Cloud API webhook. Off (404) unless arooraa.whatsapp.enabled=true.
 *
 * GET: subscription challenge — mode must be "subscribe" and the verify token must match
 * (constant time); the challenge is echoed as text/plain only if it is a short plain token.
 *
 * POST: the raw body is read here, bounded to 256 KiB before anything larger is buffered, and
 * its X-Hub-Signature-256 is verified BEFORE any parsing or database work. 401 bad/missing
 * signature, 413 too large, 400 malformed signed JSON; 200 only after {@link WhatsAppInbox}
 * has committed. Error responses never echo the payload.
 */
@RestController
@RequestMapping(WhatsAppWebhookController.PATH)
public class WhatsAppWebhookController {

    public static final String PATH = "/api/v1/whatsapp/webhook";
    static final int MAX_BODY_BYTES = 256 * 1024;
    static final String SIGNATURE_HEADER = "X-Hub-Signature-256";
    private static final Pattern CHALLENGE = Pattern.compile("^[A-Za-z0-9._\\-]{1,128}$");
    private static final Logger log = LoggerFactory.getLogger(WhatsAppWebhookController.class);

    private final WhatsAppProperties properties;
    private final WhatsAppInbox inbox;
    private final MetaWebhookDecoder decoder;

    public WhatsAppWebhookController(WhatsAppProperties properties, WhatsAppInbox inbox, JsonMapper jsonMapper) {
        this.properties = properties;
        this.inbox = inbox;
        this.decoder = new MetaWebhookDecoder(jsonMapper, properties.businessAccountId(), properties.phoneNumberId(),
                Clock.systemUTC());
    }

    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> verify(@RequestParam(name = "hub.mode", required = false) String mode,
                                         @RequestParam(name = "hub.verify_token", required = false) String token,
                                         @RequestParam(name = "hub.challenge", required = false) String challenge) {
        requireEnabled();
        if (mode == null || token == null || challenge == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!"subscribe".equals(mode) || !constantTimeEquals(token, properties.verifyToken())) {
            log.warn("whatsapp-webhook verification rejected");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (!CHALLENGE.matcher(challenge).matches()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(challenge);
    }

    @PostMapping
    public ResponseEntity<Void> receive(@RequestHeader(value = SIGNATURE_HEADER, required = false) String signature,
                                        HttpServletRequest request) throws IOException {
        requireEnabled();
        if (request.getContentLengthLong() > MAX_BODY_BYTES) {
            return reject(HttpStatus.CONTENT_TOO_LARGE, "TOO_LARGE");
        }
        byte[] body;
        try (InputStream in = request.getInputStream()) {
            body = in.readNBytes(MAX_BODY_BYTES + 1);
        }
        if (body.length > MAX_BODY_BYTES) {
            return reject(HttpStatus.CONTENT_TOO_LARGE, "TOO_LARGE");
        }
        if (!MetaWebhookSignatureVerifier.verify(body, signature, properties.appSecret())) {
            return reject(HttpStatus.UNAUTHORIZED, "BAD_SIGNATURE");
        }
        Decoded decoded;
        try {
            decoded = decoder.decode(body);
        } catch (MalformedWebhookException e) {
            return reject(HttpStatus.BAD_REQUEST, "MALFORMED_" + e.getMessage());
        }
        if (!decoded.isEmpty()) {
            inbox.accept(decoded);
        } else {
            log.info("whatsapp-webhook acknowledged without writes ignored={}", decoded.ignored());
        }
        return ResponseEntity.ok().build();
    }

    private void requireEnabled() {
        if (!properties.enabled()) {
            throw new FeatureDisabledException();
        }
    }

    private static ResponseEntity<Void> reject(HttpStatus status, String reason) {
        log.warn("whatsapp-webhook rejected reason={}", reason);
        return ResponseEntity.status(status).build();
    }

    private static boolean constantTimeEquals(String presented, String expected) {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] a = sha.digest(presented.getBytes(StandardCharsets.UTF_8));
            byte[] b = sha.digest(expected.getBytes(StandardCharsets.UTF_8));
            return !expected.isEmpty() && MessageDigest.isEqual(a, b);
        } catch (java.security.NoSuchAlgorithmException e) {
            return false;
        }
    }
}
