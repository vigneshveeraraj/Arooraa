package com.arooraa.aura.discovery.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Backed by {@code aura.discovery.*}. Off by default, like everything else that can reach outside
 * this service.
 *
 * @param handoffEnabled whether Aura may create a Start Project enquiry at all. With it false a
 *        visitor can still have the whole conversation and see their brief; only the last step is
 *        unavailable, and Aura says so plainly
 * @param startProjectBaseUrl where the existing Start Project workflow lives. Aura calls the same
 *        public endpoint the website's own form posts to — there is no second lead store, and no
 *        credential involved
 * @param minVisitorTurns how many things a visitor has to have said before a summary is offered.
 *        A brief built from one sentence is not a brief
 */
@ConfigurationProperties(prefix = "aura.discovery")
public record DiscoveryProperties(boolean handoffEnabled, String startProjectBaseUrl, int timeoutSeconds,
                                   int minVisitorTurns) {

    public DiscoveryProperties {
        if (startProjectBaseUrl == null) startProjectBaseUrl = "";
        if (timeoutSeconds <= 0) timeoutSeconds = 15;
        if (minVisitorTurns <= 0) minVisitorTurns = 3;
    }
}
