package com.arooraa.leads.capture.conversation.web;

import com.arooraa.leads.capture.exception.FeatureDisabledException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * The simulator's on switch and token check, as an interceptor so it runs before the body is read:
 * without the token, every request — even malformed JSON — is a plain 404, so a caller can't tell
 * the endpoint exists. Off unless arooraa.lead-conversation.simulator.enabled=true AND a token of
 * at least 24 characters is configured and sent as X-Simulator-Token.
 */
@Configuration
public class LeadConversationSimulatorGate implements WebMvcConfigurer {

    static final int MIN_TOKEN_LENGTH = 24;
    static final String TOKEN_HEADER = "X-Simulator-Token";

    private final boolean enabled;
    private final byte[] token;

    public LeadConversationSimulatorGate(
            @Value("${arooraa.lead-conversation.simulator.enabled:false}") boolean enabled,
            @Value("${arooraa.lead-conversation.simulator.token:}") String token) {
        this.enabled = enabled && token.length() >= MIN_TOKEN_LENGTH;
        this.token = token.getBytes(StandardCharsets.UTF_8);
    }

    boolean isAuthorized(String presentedToken) {
        return enabled && presentedToken != null
                && MessageDigest.isEqual(token, presentedToken.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
                if (!isAuthorized(request.getHeader(TOKEN_HEADER))) {
                    throw new FeatureDisabledException();
                }
                return true;
            }
        }).addPathPatterns("/api/v1/lead-conversations/simulator", "/api/v1/lead-conversations/simulator/**");
    }
}
