package com.arooraa.aura.config;

import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Default-deny, matching lead-service's convention: the health check plus exactly the routes a
 * milestone has deliberately opened, and nothing else.
 *
 * <p>A3 adds the local chat API and its manual test page. Neither is protected by this filter
 * chain — they are gated by {@code aura.chat.enabled}, which defaults to false and means the
 * controllers are not registered at all, so the routes 404. That is the stronger guarantee: with
 * chat off there is no endpoint to reach, authenticated or otherwise. Opening this surface to the
 * public internet is a separate, explicit decision that A3 does not make (no deployment, no
 * arooraa.com integration).
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Without this, the container's error dispatch is itself an authorization
                        // check that `denyAll` rejects — so every 404 and 500 reaches the client as
                        // a 403, and a caller cannot tell "no such conversation" from "not allowed".
                        // The error dispatch is not a route anyone can request directly.
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/api/v1/aura/**", "/aura-test").permitAll()
                        .anyRequest().denyAll())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);

        return http.build();
    }
}
