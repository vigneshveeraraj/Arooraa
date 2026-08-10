package com.arooraa.leads.admin.auth.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Plain JSON 401 for an unauthenticated request to a protected admin endpoint — the
 * default Spring Security behaviour (a 403 with no body, or a login-page redirect) isn't
 * useful for a REST API/SPA, which needs a predictable body to detect "not logged in"
 * and show the login screen.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"code\":\"UNAUTHENTICATED\",\"message\":\"Authentication required.\"}");
    }
}
