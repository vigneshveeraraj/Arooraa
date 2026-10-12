package com.arooraa.leads.capture.whatsapp;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;
import java.util.regex.Pattern;

/**
 * Backed by {@code arooraa.whatsapp.*} (ops/whatsapp-integration.md). Two independent switches,
 * both off by default: {@code enabled} turns on the webhook and inbound processing,
 * {@code outbound-enabled} additionally lets replies be sent through the Cloud API. Credentials
 * are only required — and then validated, failing startup — for the switch that needs them.
 *
 * There is deliberately no base-URL property: the Graph host is fixed to
 * https://graph.facebook.com in {@link CloudApiWhatsAppGateway}, so no configuration can point the
 * access token at another endpoint. Tests replace the {@link WhatsAppGateway} bean instead.
 */
@ConfigurationProperties(prefix = "arooraa.whatsapp")
public record WhatsAppProperties(
        @DefaultValue("false") boolean enabled,
        @DefaultValue("false") boolean outboundEnabled,
        @DefaultValue("") String appSecret,
        @DefaultValue("") String verifyToken,
        @DefaultValue("") String accessToken,
        @DefaultValue("") String phoneNumberId,
        @DefaultValue("") String businessAccountId,
        @DefaultValue("") String apiVersion,
        @DefaultValue("3000") int connectTimeoutMs,
        @DefaultValue("10000") int requestTimeoutMs,
        @DefaultValue Worker worker
) {
    public static final int MIN_VERIFY_TOKEN_LENGTH = 24;
    static final int MIN_APP_SECRET_LENGTH = 16;
    static final Pattern META_ID = Pattern.compile("^[0-9]{5,30}$");
    static final Pattern API_VERSION = Pattern.compile("^v[1-9][0-9]{0,2}\\.[0-9]{1,2}$");

    public record Worker(@DefaultValue("false") boolean enabled,
                         @DefaultValue("2000") long cadenceMs,
                         @DefaultValue("20") int batchSize) {
    }

    /** Fails closed with the property name only — never a value. */
    void validate() {
        if (outboundEnabled && !enabled) {
            throw invalid("outbound-enabled requires arooraa.whatsapp.enabled=true");
        }
        if (enabled) {
            require(appSecret.length() >= MIN_APP_SECRET_LENGTH, "app-secret must be set (at least 16 characters)");
            require(verifyToken.length() >= MIN_VERIFY_TOKEN_LENGTH, "verify-token must be at least 24 characters");
            require(!verifyToken.equals(appSecret), "verify-token must differ from app-secret");
            require(META_ID.matcher(phoneNumberId).matches(), "phone-number-id must be the numeric Meta id");
            require(META_ID.matcher(businessAccountId).matches(), "business-account-id must be the numeric Meta id");
            require(worker.batchSize() >= 1 && worker.batchSize() <= 100, "worker.batch-size must be 1..100");
            require(worker.cadenceMs() >= 500, "worker.cadence-ms must be at least 500");
        }
        if (outboundEnabled) {
            require(accessToken.length() >= 20 && accessToken.chars().noneMatch(Character::isWhitespace),
                    "access-token must be set");
            require(API_VERSION.matcher(apiVersion).matches(), "api-version must be set explicitly, e.g. vNN.N");
            require(connectTimeoutMs >= 100 && connectTimeoutMs <= 10_000, "connect-timeout-ms must be 100..10000");
            require(requestTimeoutMs >= 1_000 && requestTimeoutMs <= 30_000, "request-timeout-ms must be 1000..30000");
        }
    }

    Duration connectTimeout() {
        return Duration.ofMillis(connectTimeoutMs);
    }

    Duration requestTimeout() {
        return Duration.ofMillis(requestTimeoutMs);
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw invalid(message);
        }
    }

    private static IllegalStateException invalid(String message) {
        return new IllegalStateException("Invalid WhatsApp configuration: arooraa.whatsapp." + message);
    }

    /** Never print credentials, even if this record ends up in a log or an exception. */
    @Override
    public String toString() {
        return "WhatsAppProperties[enabled=" + enabled + ", outboundEnabled=" + outboundEnabled
                + ", apiVersion=" + apiVersion + ", worker=" + worker + ", credentials=<redacted>]";
    }
}
