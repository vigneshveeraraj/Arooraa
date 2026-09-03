package com.arooraa.aura.protection;

import com.arooraa.aura.protection.config.ProtectionProperties;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Who to count a request against.
 *
 * <p>The only honest answer available to this service is a network address, and the whole question
 * is which one. Behind a reverse proxy the socket always says the proxy, so every visitor in the
 * world shares one bucket and the limiter counts nothing useful. Directly exposed, an
 * {@code X-Forwarded-For} header is a value the caller typed, so trusting it lets anyone pick a
 * fresh identity per request and the limiter counts nothing at all.
 *
 * <p>Both failures are silent, and they are opposites, so this cannot be decided by guessing at
 * runtime — a heuristic would be wrong in whichever direction the deployment was not. It is
 * configuration: {@code aura.protection.trust-proxy-headers} is false by default, which is correct
 * for a service reached directly and for every test, and the production runbook turns it on in the
 * same step that puts Nginx in front. Nginx must be configured to <em>set</em> the header rather
 * than append to a client-supplied one; the leftmost value is only trustworthy if the proxy owns it.
 *
 * <p>There is deliberately no cookie, session or fingerprint here. A7 established that this service
 * keeps nothing identifying a visitor, and inventing an identifier for rate limiting would undo
 * that for the convenience of a slightly better bucket.
 */
public class ClientKeyResolver {

    private static final String FORWARDED_FOR = "X-Forwarded-For";

    /** Long enough for an IPv6 address with a zone, short enough not to be a memory lever. */
    private static final int MAX_KEY_LENGTH = 64;

    private final ProtectionProperties properties;

    public ClientKeyResolver(ProtectionProperties properties) {
        this.properties = properties;
    }

    public String resolve(HttpServletRequest request) {
        if (properties.trustProxyHeaders()) {
            String forwarded = request.getHeader(FORWARDED_FOR);
            if (forwarded != null && !forwarded.isBlank()) {
                // The leftmost entry is the original client, everything after it the proxy chain.
                String client = forwarded.split(",", 2)[0].strip();
                if (!client.isEmpty()) return truncate(client);
            }
        }
        String remote = request.getRemoteAddr();
        return remote == null || remote.isBlank() ? "unknown" : truncate(remote);
    }

    /**
     * A forged header can be as long as the caller likes, and this string becomes a map key that is
     * held until it is evicted. Truncation means the worst case is a shared bucket rather than a
     * bucket the size of the request.
     */
    private static String truncate(String value) {
        return value.length() <= MAX_KEY_LENGTH ? value : value.substring(0, MAX_KEY_LENGTH);
    }
}
