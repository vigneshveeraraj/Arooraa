package com.arooraa.leads.admin.auth.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * W3.2B.1: local development ({@code next dev}, no reverse proxy) calls this backend directly
 * across origins, unlike production (same-origin behind Nginx, needs no CORS at all — see
 * ops/nginx/arooraa.com.conf). Empty-by-default is the safety property under test here as much
 * as the allow-list itself.
 */
class SecurityConfigCorsTest {

    private final SecurityConfig config = new SecurityConfig();

    @Test
    void emptyConfigurationMeansNoCorsAnywhereNotEvenOnPublicPaths() {
        CorsConfigurationSource source = config.corsConfigurationSource("");

        assertNull(source.getCorsConfiguration(requestTo("/api/v1/project-enquiries")));
        assertNull(source.getCorsConfiguration(requestTo("/api/v1/demo-requests")));
    }

    @Test
    void configuredOriginIsAllowedOnlyForThePublicLeadSubmissionPaths() {
        CorsConfigurationSource source = config.corsConfigurationSource("http://localhost:3000");

        CorsConfiguration projectEnquiries = source.getCorsConfiguration(requestTo("/api/v1/project-enquiries"));
        assertTrue(projectEnquiries.getAllowedOrigins().contains("http://localhost:3000"));

        CorsConfiguration demoRequests = source.getCorsConfiguration(requestTo("/api/v1/demo-requests"));
        assertTrue(demoRequests.getAllowedOrigins().contains("http://localhost:3000"));

        // Admin routes must never get CORS-enabled — their cookie/CSRF model requires
        // same-origin regardless of what's configured for the public endpoints.
        assertNull(source.getCorsConfiguration(requestTo("/api/v1/admin/leads")));
    }

    @Test
    void neverAllowsTheWildcardOrigin() {
        CorsConfigurationSource source = config.corsConfigurationSource("http://localhost:3000, https://staging.example.com");

        CorsConfiguration configuration = source.getCorsConfiguration(requestTo("/api/v1/project-enquiries"));
        assertEquals(2, configuration.getAllowedOrigins().size());
        assertTrue(configuration.getAllowedOrigins().stream().noneMatch("*"::equals));
    }

    @Test
    void multipleCommaSeparatedOriginsAreAllTrimmedAndHonoured() {
        CorsConfigurationSource source = config.corsConfigurationSource(" http://localhost:3000 , http://localhost:3001 ");

        CorsConfiguration configuration = source.getCorsConfiguration(requestTo("/api/v1/project-enquiries"));
        assertTrue(configuration.getAllowedOrigins().contains("http://localhost:3000"));
        assertTrue(configuration.getAllowedOrigins().contains("http://localhost:3001"));
    }

    private static MockHttpServletRequest requestTo(String path) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        request.setRequestURI(path);
        return request;
    }
}
