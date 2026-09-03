package com.arooraa.aura.protection;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.EmbeddingProvider;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * What Aura can currently do, for whoever is on call (A8).
 *
 * <p>Deliberately reports capability rather than opinion. "Chat is on, the provider is wired, and
 * the day's generation budget is 41% spent" is something a person can act on; a red light labelled
 * DOWN because a switch is off would page somebody about a decision that was made on purpose.
 * Nothing here is ever {@code DOWN} for a configuration state — only the database can take this
 * service down, and Spring's own datasource indicator already says so.
 *
 * <h2>No secret ever reaches this surface</h2>
 * Booleans, counts and names of our own choosing. No API key, no key prefix, no key length, no
 * connection string, no token, no header value, and no client address. The safest way to keep a
 * credential out of an actuator response is for no code to be able to read one and put it there,
 * so this class holds no reference to anything that has one: it asks the providers whether they are
 * enabled, which is a boolean they compute for themselves.
 */
@Component
public class AuraReadinessIndicator implements HealthIndicator {

    private final ChatGenerationProvider chatProvider;
    private final EmbeddingProvider embeddingProvider;
    private final DailyCallBudget budget;

    public AuraReadinessIndicator(ChatGenerationProvider chatProvider,
                                   EmbeddingProvider embeddingProvider,
                                   DailyCallBudget budget) {
        this.chatProvider = chatProvider;
        this.embeddingProvider = embeddingProvider;
        this.budget = budget;
    }

    @Override
    public Health health() {
        Health.Builder health = Health.up()
                .withDetail("chatProvider", chatProvider.isEnabled() ? "enabled" : "disabled")
                .withDetail("embeddingProvider", embeddingProvider.isEnabled() ? "enabled" : "disabled")
                .withDetail("budgetDay", budget.day().toString());

        for (DailyCallBudget.Kind kind : DailyCallBudget.Kind.values()) {
            // Spent and ceiling, not a percentage: the two raw numbers answer "is this about to
            // stop working" and "was the ceiling set sensibly", and a percentage answers neither.
            health.withDetail("budget." + kind.name().toLowerCase(),
                    budget.spent(kind) + "/" + budget.ceilingFor(kind));
        }
        return health.build();
    }
}
