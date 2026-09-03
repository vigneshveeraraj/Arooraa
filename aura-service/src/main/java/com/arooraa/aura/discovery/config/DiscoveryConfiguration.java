package com.arooraa.aura.discovery.config;

import com.arooraa.aura.discovery.handoff.DisabledProjectEnquiryClient;
import com.arooraa.aura.discovery.handoff.HttpProjectEnquiryClient;
import com.arooraa.aura.discovery.handoff.ProjectEnquiryClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Wires the Start Project handoff, on the same terms as every provider in this codebase: two
 * conditions must hold before anything real is wired, and a misconfiguration degrades to the
 * disabled client rather than failing startup. A service that cannot reach the lead workflow must
 * still start, stay healthy, and hold discovery conversations.
 */
@Configuration
@EnableConfigurationProperties(DiscoveryProperties.class)
public class DiscoveryConfiguration {

    private static final Logger log = LoggerFactory.getLogger(DiscoveryConfiguration.class);

    /** Both the switch and a base URL, because either alone is a misconfiguration rather than an intent. */
    static class HandoffConfiguredCondition implements Condition {
        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            boolean enabled = context.getEnvironment()
                    .getProperty("aura.discovery.handoff-enabled", Boolean.class, false);
            String baseUrl = context.getEnvironment().getProperty("aura.discovery.start-project-base-url", "");
            return enabled && !baseUrl.isBlank();
        }
    }

    @Bean
    @Conditional(HandoffConfiguredCondition.class)
    public ProjectEnquiryClient httpProjectEnquiryClient(RestClient.Builder builder,
                                                           DiscoveryProperties properties) {
        Duration timeout = Duration.ofSeconds(properties.timeoutSeconds());
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(timeout);
        requestFactory.setReadTimeout(timeout);
        return new HttpProjectEnquiryClient(builder.requestFactory(requestFactory),
                properties.startProjectBaseUrl());
    }

    @Bean
    @ConditionalOnMissingBean(ProjectEnquiryClient.class)
    public ProjectEnquiryClient disabledProjectEnquiryClient(DiscoveryProperties properties) {
        if (properties.handoffEnabled()) {
            log.warn("aura.discovery.handoff-enabled=true but aura.discovery.start-project-base-url is not set — "
                    + "falling back to the disabled client, so discovery works but cannot create an enquiry.");
        }
        return new DisabledProjectEnquiryClient();
    }
}
