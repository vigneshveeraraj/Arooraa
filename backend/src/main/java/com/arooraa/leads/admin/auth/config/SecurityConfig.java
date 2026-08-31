package com.arooraa.leads.admin.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Admin authentication is cookie/session-based (HttpSession + JSESSIONID), not a bearer
 * token in localStorage — the frontend is same-origin behind Nginx in production, so a
 * browser-managed HttpOnly cookie is both simpler and safer than a JS-visible token.
 * That choice makes CSRF protection necessary: it is enabled everywhere except the public,
 * anonymous, already-independently-protected (rate limit + honeypot) submission endpoints,
 * using the standard "readable cookie, echoed back as a header" pattern for a single-page
 * app (CookieCsrfTokenRepository + CsrfCookieFilter forcing the token to be issued).
 */
@Configuration
public class SecurityConfig {

    private static final String[] PUBLIC_PATHS = {
            "/api/v1/demo-requests/**",
            "/api/v1/project-enquiries/**",
            "/actuator/health",
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Empty by default (production, same-origin behind Nginx, needs none — see
     * ops/nginx/arooraa.com.conf's /api/leads/ -> backend proxy). Only set
     * AROORAA_CORS_ALLOWED_ORIGINS when a browser must call this backend directly across
     * origins, e.g. local dev (frontend-v2 on :3000, this service on :8090) — never "*", and
     * scoped only to the already-public, already-independently-protected (rate limit +
     * honeypot) lead-submission endpoints. Admin routes are never CORS-enabled, regardless of
     * this setting: their cookie/CSRF model requires same-origin (see class Javadoc).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${arooraa.cors.allowed-origins:}") String allowedOriginsCsv) {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        List<String> allowedOrigins = Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        if (allowedOrigins.isEmpty()) {
            return source;
        }
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Idempotency-Key"));
        configuration.setAllowCredentials(false);
        source.registerCorsConfiguration("/api/v1/project-enquiries/**", configuration);
        source.registerCorsConfiguration("/api/v1/demo-requests/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new org.springframework.security.authentication.ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            RestAuthenticationEntryPoint entryPoint,
            RestAccessDeniedHandler accessDeniedHandler,
            CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                        .ignoringRequestMatchers(PUBLIC_PATHS))
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_PATHS).permitAll()
                        .requestMatchers("/api/v1/admin/auth/login", "/api/v1/admin/auth/logout").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasAuthority("ADMIN")
                        .anyRequest().denyAll())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);

        return http.build();
    }
}
