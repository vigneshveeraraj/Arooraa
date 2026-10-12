package com.arooraa.leads.capture.whatsapp;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Turns an already signature-verified Meta webhook body into typed messages and statuses for the
 * configured account only. The whole payload is decoded before anything is stored, so one invalid
 * item rejects the whole delivery ({@link MalformedWebhookException}) and nothing half-commits.
 *
 * Scope: {@code text}, interactive {@code button_reply}/{@code list_reply} titles and quick-reply
 * {@code button} text — all of which the existing numeric/text script understands. Media, location,
 * reactions, unknown types, texts over 2000 characters and entries for another WABA/phone number
 * are acknowledged and ignored. {@code contacts}/profile fields are never read.
 */
public final class MetaWebhookDecoder {

    static final int MAX_TEXT = 2000;
    static final int MAX_ENTRIES = 50;
    static final int MAX_CHANGES = 50;
    static final int MAX_ITEMS_PER_CHANGE = 200;
    static final int MAX_ITEMS_TOTAL = 1000;
    static final Duration MAX_FUTURE_SKEW = Duration.ofMinutes(5);

    private static final Pattern FROM = Pattern.compile("^[1-9][0-9]{7,14}$");
    private static final Pattern WAMID = Pattern.compile("^[A-Za-z0-9._=:+/\\-]{1,200}$");
    private static final Pattern EPOCH_SECONDS = Pattern.compile("^[0-9]{1,12}$");

    public record InboundText(String wamid, String participantPhone, String text, Instant sourceTimestamp,
                              String fingerprint) {
    }

    /** {@code status} is Meta's lower-case value: sent | delivered | read | failed. */
    public record StatusUpdate(String wamid, String recipientDigits, String status, Instant timestamp,
                               UUID callbackId, String errorCode) {
    }

    public record Decoded(List<InboundText> messages, List<StatusUpdate> statuses, int ignored) {
        public boolean isEmpty() {
            return messages.isEmpty() && statuses.isEmpty();
        }
    }

    public static final class MalformedWebhookException extends RuntimeException {
        MalformedWebhookException(String reason) {
            super(reason, null, false, false);
        }
    }

    private final JsonMapper json;
    private final String businessAccountId;
    private final String phoneNumberId;
    private final Clock clock;

    public MetaWebhookDecoder(JsonMapper json, String businessAccountId, String phoneNumberId, Clock clock) {
        this.json = json;
        this.businessAccountId = businessAccountId;
        this.phoneNumberId = phoneNumberId;
        this.clock = clock;
    }

    public Decoded decode(byte[] body) {
        JsonNode root;
        try {
            root = json.readTree(body);
        } catch (JacksonException e) {
            throw new MalformedWebhookException("INVALID_JSON");
        }
        if (root == null || !root.isObject()) {
            throw new MalformedWebhookException("NOT_AN_OBJECT");
        }
        List<InboundText> messages = new ArrayList<>();
        List<StatusUpdate> statuses = new ArrayList<>();
        int ignored = 0;
        if (!"whatsapp_business_account".equals(root.path("object").asString(""))) {
            return new Decoded(List.of(), List.of(), 1);
        }
        JsonNode entries = array(root.get("entry"), MAX_ENTRIES, "ENTRY");
        Instant now = clock.instant();
        int total = 0;
        for (JsonNode entry : entries) {
            if (!entry.isObject()) throw new MalformedWebhookException("ENTRY");
            if (!businessAccountId.equals(entry.path("id").asString(""))) {
                ignored++;
                continue;
            }
            for (JsonNode change : array(entry.get("changes"), MAX_CHANGES, "CHANGES")) {
                JsonNode value = change.path("value");
                if (!"messages".equals(change.path("field").asString("")) || !value.isObject()) {
                    ignored++;
                    continue;
                }
                if (!phoneNumberId.equals(value.path("metadata").path("phone_number_id").asString(""))) {
                    ignored++;
                    continue;
                }
                List<JsonNode> inbound = optionalArray(value.get("messages"), "MESSAGES");
                List<JsonNode> status = optionalArray(value.get("statuses"), "STATUSES");
                total += inbound.size() + status.size();
                if (inbound.size() + status.size() > MAX_ITEMS_PER_CHANGE || total > MAX_ITEMS_TOTAL) {
                    throw new MalformedWebhookException("TOO_MANY_ITEMS");
                }
                for (JsonNode m : inbound) {
                    InboundText decoded = message(m, now);
                    if (decoded == null) ignored++;
                    else messages.add(decoded);
                }
                for (JsonNode s : status) {
                    StatusUpdate decoded = status(s, now);
                    if (decoded == null) ignored++;
                    else statuses.add(decoded);
                }
            }
        }
        return new Decoded(List.copyOf(messages), List.copyOf(statuses), ignored);
    }

    private InboundText message(JsonNode m, Instant now) {
        if (!m.isObject()) throw new MalformedWebhookException("MESSAGE");
        String wamid = required(m.get("id"), WAMID, "MESSAGE_ID");
        String from = required(m.get("from"), FROM, "MESSAGE_FROM");
        Instant at = timestamp(m.get("timestamp"), now);
        String type = m.path("type").asString("");
        String text = switch (type) {
            case "text" -> requiredString(m.path("text").get("body"), "TEXT_BODY");
            case "interactive" -> {
                JsonNode interactive = m.path("interactive");
                String kind = interactive.path("type").asString("");
                yield kind.equals("button_reply") || kind.equals("list_reply")
                        ? requiredString(interactive.path(kind).get("title"), "INTERACTIVE_TITLE") : null;
            }
            case "button" -> requiredString(m.path("button").get("text"), "BUTTON_TEXT");
            default -> null;
        };
        if (text == null || text.length() > MAX_TEXT) {
            return null;
        }
        String phone = "+" + from;
        return new InboundText(wamid, phone, text, at, sha256(phone + "\n" + at.getEpochSecond() + "\n" + text));
    }

    private StatusUpdate status(JsonNode s, Instant now) {
        if (!s.isObject()) throw new MalformedWebhookException("STATUS");
        String wamid = required(s.get("id"), WAMID, "STATUS_ID");
        String recipient = required(s.get("recipient_id"), FROM, "STATUS_RECIPIENT");
        Instant at = timestamp(s.get("timestamp"), now);
        String status = s.path("status").asString("");
        if (!List.of("sent", "delivered", "read", "failed").contains(status)) {
            return null;
        }
        UUID callback = null;
        String opaque = s.path("biz_opaque_callback_data").asString("");
        if (opaque.length() == 36) {
            try {
                callback = UUID.fromString(opaque);
            } catch (IllegalArgumentException ignored) {
                // Not one of ours: reconcile by Meta id only.
            }
        }
        String errorCode = null;
        JsonNode code = s.path("errors").path(0).path("code");
        if (code.isIntegralNumber() && code.canConvertToLong()) {
            errorCode = "META_" + Math.abs(code.asLong() % 10_000_000L);
        }
        return new StatusUpdate(wamid, recipient, status, at, callback, errorCode);
    }

    private static JsonNode array(JsonNode node, int max, String what) {
        if (node == null || !node.isArray() || node.size() > max) {
            throw new MalformedWebhookException(what);
        }
        return node;
    }

    private static List<JsonNode> optionalArray(JsonNode node, String what) {
        if (node == null || node.isNull()) {
            return List.of();
        }
        if (!node.isArray() || node.size() > MAX_ITEMS_PER_CHANGE) throw new MalformedWebhookException(what);
        List<JsonNode> items = new ArrayList<>(node.size());
        node.forEach(items::add);
        return items;
    }

    private static String required(JsonNode node, Pattern pattern, String what) {
        if (node == null || !node.isString() || !pattern.matcher(node.asString()).matches()) {
            throw new MalformedWebhookException(what);
        }
        return node.asString();
    }

    private static String requiredString(JsonNode node, String what) {
        if (node == null || !node.isString()) {
            throw new MalformedWebhookException(what);
        }
        return node.asString();
    }

    private static Instant timestamp(JsonNode node, Instant now) {
        String raw = node == null ? "" : node.isIntegralNumber() ? node.asString() : node.isString() ? node.asString() : "";
        if (!EPOCH_SECONDS.matcher(raw).matches()) {
            throw new MalformedWebhookException("TIMESTAMP");
        }
        Instant at = Instant.ofEpochSecond(Long.parseLong(raw));
        if (at.isAfter(now.plus(MAX_FUTURE_SKEW)) || at.equals(Instant.EPOCH)) {
            throw new MalformedWebhookException("TIMESTAMP");
        }
        return at;
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
