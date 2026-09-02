package com.arooraa.aura.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Backed by {@code aura.cors.*}. Empty by default, which means no CORS configuration is registered
 * at all and the browser's same-origin policy is the only thing that needs to hold.
 *
 * <p>Exists for one situation: running {@code next dev} on {@code http://localhost:3000} while
 * aura-service runs on {@code :8091}. Those are different origins, so a direct browser call is
 * cross-origin. The preferred local answer is the Next dev rewrite that proxies
 * {@code /api/aura/*} to the backend server-side, which keeps every browser request same-origin
 * and needs nothing here — see {@code frontend-v2/next.config.ts}. This is the escape hatch for a
 * developer who would rather point {@code NEXT_PUBLIC_AURA_API_BASE_URL} straight at the backend.
 *
 * @param allowedOrigins exact origins permitted to call {@code /api/v1/aura/**}. Never a wildcard:
 *        the list is matched exactly, so a deployment that forgets to set it stays closed rather
 *        than open to everyone
 */
@ConfigurationProperties(prefix = "aura.cors")
public record AuraCorsProperties(List<String> allowedOrigins) {

    public AuraCorsProperties {
        allowedOrigins = allowedOrigins == null ? List.of() : List.copyOf(allowedOrigins);
    }

    public boolean isConfigured() {
        return !allowedOrigins.isEmpty();
    }
}
