package com.arooraa.aura.protection.config;

import com.arooraa.aura.protection.AuraRateLimitFilter;
import com.arooraa.aura.protection.ClientKeyResolver;
import com.arooraa.aura.protection.TokenBucketRateLimiter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

/**
 * Wires the rate limiter, or does not wire it at all.
 *
 * <p>Switched off, there is no filter in the chain rather than a filter that waves everything
 * through — the same shape as every other switch in this service. A test that needs to drive the
 * API hard says so in its own properties, which is better than a limiter loose enough to be
 * invisible in tests and therefore useless in production.
 */
@Configuration
public class ProtectionConfiguration {

    private static final Logger log = LoggerFactory.getLogger(ProtectionConfiguration.class);

    @Bean
    @ConditionalOnProperty(prefix = "aura.protection", name = "enabled", havingValue = "true",
            matchIfMissing = true)
    FilterRegistrationBean<AuraRateLimitFilter> auraRateLimitFilter(ProtectionProperties properties,
                                                                     MeterRegistry meterRegistry) {
        log.info("Aura rate limiting is on ({}/min messages, {}/min voice, {}/min handoff; proxy headers {}).",
                properties.messages().perMinute(), properties.voice().perMinute(),
                properties.handoff().perMinute(),
                properties.trustProxyHeaders() ? "trusted" : "ignored");

        FilterRegistrationBean<AuraRateLimitFilter> registration = new FilterRegistrationBean<>(
                new AuraRateLimitFilter(properties,
                        new TokenBucketRateLimiter(properties, System::currentTimeMillis),
                        new ClientKeyResolver(properties), meterRegistry));
        // Ahead of everything else that could do work on this request's behalf. A refusal is only
        // cheap if it happens before the body is read.
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
        registration.addUrlPatterns("/api/v1/aura/*");
        return registration;
    }
}
