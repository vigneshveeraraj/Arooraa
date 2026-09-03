package com.arooraa.aura.retention;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Turns the scheduler on, and only when there is something for it to do.
 *
 * <p>Scheduling is enabled here rather than on the application class so that switching retention
 * off leaves this service with no background threads at all, which is what a test run and a
 * one-shot bootstrap both want. {@link RetentionService#sweep()} checks the same switch again, so a
 * scheduler running for some future reason still cannot delete anything an operator has said not to.
 */
@Configuration
@EnableScheduling
@ConditionalOnProperty(prefix = "aura.retention", name = "enabled", havingValue = "true",
        matchIfMissing = true)
public class RetentionConfiguration {
}
