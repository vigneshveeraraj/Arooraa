package com.arooraa.leads.capture.web;

import com.arooraa.leads.capture.exception.FeatureDisabledException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * arooraa.lead-capture.enabled=false turns the lead-capture endpoint into a 404 for every request.
 * An interceptor rather than a check in the controller because it runs before the body is read
 * and validated, so a disabled endpoint never answers with field errors that reveal its contract.
 */
@Configuration
public class LeadCaptureFeatureGate implements WebMvcConfigurer {

    private final boolean enabled;

    public LeadCaptureFeatureGate(@Value("${arooraa.lead-capture.enabled:true}") boolean enabled) {
        this.enabled = enabled;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
                if (!enabled) {
                    throw new FeatureDisabledException();
                }
                return true;
            }
        }).addPathPatterns("/api/v1/lead-captures", "/api/v1/lead-captures/**");
    }
}
