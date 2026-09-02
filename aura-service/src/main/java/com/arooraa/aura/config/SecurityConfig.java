package com.arooraa.aura.config;

import jakarta.servlet.DispatcherType;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.List;

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
 *
 * <p>A4 adds an optional CORS allowance for local frontend development, off unless
 * {@code aura.cors.allowed-origins} names an origin explicitly. With it unset — the default, and
 * what any deployment gets — no {@code CorsConfigurationSource} bean exists, so this chain emits
 * no CORS headers and a cross-origin browser call is refused by the browser itself.
 */
@Configuration
public class SecurityConfig {

    /**
     * Only ever built from an explicit list of origins. There is deliberately no wildcard branch:
     * a misconfiguration should fail closed (nobody may call cross-origin) rather than open.
     *
     * <p>The method name is the bean name and Spring Security looks this up <em>by name</em>
     * ({@code corsConfigurationSource}); named anything else it is silently ignored and the chain
     * falls back to Spring MVC's own empty CORS configuration, which emits no headers and looks
     * exactly like the feature not working.
     */
    @Bean
    @ConditionalOnExpression("!'${aura.cors.allowed-origins:}'.isEmpty()")
    public CorsConfigurationSource corsConfigurationSource(AuraCorsProperties properties) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(properties.allowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(Duration.ofMinutes(10));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // The chat API only. Actuator and the manual test page are not part of this allowance.
        source.registerCorsConfiguration("/api/v1/aura/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // A no-op unless the conditional bean above exists.
                .cors(Customizer.withDefaults())
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
