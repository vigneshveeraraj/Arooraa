package com.arooraa.aura.insight.api;

import com.arooraa.aura.insight.InsightQueryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * The operator's read-only view of how Aura is doing. Not a public surface, and gated three times
 * over — because "internal" is a claim, and each of these is a mechanism.
 *
 * <ol>
 *   <li><b>The bean does not exist unless asked for.</b> {@code aura.insights.api-enabled} defaults
 *       to false, so the route 404s rather than refusing — the same guarantee the chat and voice
 *       surfaces give.</li>
 *   <li><b>A token is required.</b> Read from {@code AURA_INSIGHTS_TOKEN}, never from
 *       configuration this service prints, and compared with {@link MessageDigest#isEqual} so the
 *       comparison does not leak the token's prefix through its own timing. A blank token means
 *       the endpoint refuses everything, so enabling the switch without setting one fails closed
 *       rather than open.</li>
 *   <li><b>It is a reverse proxy's job too.</b> A8's Nginx template does not expose this path
 *       publicly at all. This controller is what makes that a second lock rather than the only
 *       one.</li>
 * </ol>
 *
 * <p>Read-only on purpose. Moving a gap to resolved is a real action with a real audit question
 * attached, and an endpoint that can change state needs an identity behind it rather than a shared
 * secret. Until there is one, that is done in the database by a person who has access to it.
 */
@RestController
@RequestMapping("/api/v1/aura/internal/insights")
@ConditionalOnProperty(prefix = "aura.insights", name = "api-enabled", havingValue = "true")
public class AuraInsightsController {

    private static final Logger log = LoggerFactory.getLogger(AuraInsightsController.class);

    private final InsightQueryService insights;
    private final byte[] token;

    public AuraInsightsController(InsightQueryService insights,
                                   @Value("${AURA_INSIGHTS_TOKEN:}") String token) {
        this.insights = insights;
        this.token = token == null ? new byte[0] : token.getBytes(StandardCharsets.UTF_8);
        if (this.token.length == 0) {
            log.warn("aura.insights.api-enabled=true but AURA_INSIGHTS_TOKEN is not set — "
                    + "the internal insights endpoint will refuse every request.");
        }
    }

    @GetMapping
    public InsightDtos.InsightsResponse snapshot(
            @RequestHeader(value = "X-Aura-Insights-Token", required = false) String presented) {
        authorize(presented);
        return InsightDtos.InsightsResponse.from(insights.snapshot());
    }

    /**
     * 404 rather than 401, and no {@code WWW-Authenticate} header. Someone probing this path
     * should learn nothing from the difference between "wrong token" and "no such route" — the
     * whole point of the surface being internal is that its existence is not public information.
     */
    private void authorize(String presented) {
        byte[] offered = presented == null ? new byte[0] : presented.getBytes(StandardCharsets.UTF_8);
        if (token.length == 0 || !MessageDigest.isEqual(token, offered)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }
}
