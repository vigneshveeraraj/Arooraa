package com.arooraa.aura.protection;

import com.arooraa.aura.protection.config.ProtectionProperties;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * The first thing a request to Aura meets (A8).
 *
 * <p>A filter rather than an interceptor or a per-controller check, so it runs before request
 * bodies are parsed, before a multipart upload is buffered, and before any controller exists to be
 * reached. That ordering is the point on the voice surface: a refusal that happens after Tomcat has
 * read four megabytes of audio has already paid for the request it is refusing.
 *
 * <h2>Surfaces have separate allowances</h2>
 * Counting every Aura request against one bucket would let somebody who is genuinely mid-conversation
 * lose the ability to send the project brief they just wrote, and would let a script exhaust a
 * visitor's question allowance by hammering the cheapest endpoint. Each surface carries its own,
 * sized by what it costs us — a conversation row, a generation, a generation plus an audio file, or
 * something a person at AROORAA has to read.
 *
 * <h2>What a refused caller is told</h2>
 * 429, a {@code Retry-After}, and a sentence Aura would say. Not a stack trace, not a limit, not a
 * count of how many they have left — an abuse control that reports its own thresholds is a
 * calibration tool for the next attempt.
 */
public class AuraRateLimitFilter extends OncePerRequestFilter {

    /** What kind of request this is, and therefore which allowance it spends. */
    enum Surface {
        CONVERSATIONS, MESSAGES, VOICE, BRIEF, HANDOFF, OTHER
    }

    private static final String AURA_PREFIX = "/api/v1/aura/";

    private final ProtectionProperties properties;
    private final TokenBucketRateLimiter limiter;
    private final ClientKeyResolver clientKeys;
    private final MeterRegistry meterRegistry;

    public AuraRateLimitFilter(ProtectionProperties properties, TokenBucketRateLimiter limiter,
                                ClientKeyResolver clientKeys, MeterRegistry meterRegistry) {
        this.properties = properties;
        this.limiter = limiter;
        this.clientKeys = clientKeys;
        this.meterRegistry = meterRegistry;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Only Aura's own API. The actuator has its own exposure rules and is not reachable from a
        // browser; static resources and the local test page cost nothing.
        return !request.getRequestURI().startsWith(AURA_PREFIX);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain chain) throws ServletException, IOException {
        Surface surface = surfaceOf(request);
        String key = clientKeys.resolve(request) + "|" + surface;

        TokenBucketRateLimiter.Decision decision = limiter.request(key, limitFor(surface));
        if (decision.allowed()) {
            chain.doFilter(request, response);
            return;
        }

        // Counted by surface and never by caller: a metric labelled with an address would rebuild,
        // in the monitoring system, exactly the per-visitor record this service does not keep.
        meterRegistry.counter("aura.protection.rate_limited", "surface", surface.name()).increment();
        refuse(response, decision.retryAfterSeconds());
    }

    private ProtectionProperties.Limit limitFor(Surface surface) {
        return switch (surface) {
            case CONVERSATIONS -> properties.conversations();
            case MESSAGES -> properties.messages();
            case VOICE -> properties.voice();
            case BRIEF -> properties.brief();
            case HANDOFF -> properties.handoff();
            case OTHER -> properties.other();
        };
    }

    /**
     * Matched on the path's shape rather than by asking Spring which handler would run, because
     * this filter deliberately executes before handler mapping. The paths are stable and few.
     */
    static Surface surfaceOf(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean writing = !"GET".equalsIgnoreCase(request.getMethod());
        if (!writing) {
            // Reading a brief, or asking what voice can do, costs a query. Only the writes below
            // reach a provider or create anything.
            return Surface.OTHER;
        }
        if (path.startsWith(AURA_PREFIX + "voice/")) return Surface.VOICE;
        if (path.endsWith("/brief/handoff")) return Surface.HANDOFF;
        if (path.endsWith("/brief")) return Surface.BRIEF;
        if (path.endsWith("/messages")) return Surface.MESSAGES;
        if (path.equals(AURA_PREFIX + "conversations")) return Surface.CONVERSATIONS;
        return Surface.OTHER;
    }

    private static void refuse(HttpServletResponse response, int retryAfterSeconds) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("""
                {"code":"TOO_MANY_REQUESTS",\
                "message":"That's a lot at once — give me a moment and try again."}""");
    }
}
