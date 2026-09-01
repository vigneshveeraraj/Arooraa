package com.arooraa.aura.bootstrap;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Backed by {@code aura.bootstrap.*} — the local knowledge bootstrap, off unless explicitly asked
 * for.
 *
 * @param publicKnowledge whether to load the approved public corpus into this database on startup.
 *        Default false: loading knowledge is a deliberate act, and a service that silently indexes
 *        whatever markdown it finds next to it is not one anybody should deploy
 * @param sourceDirectory where the approved documents live, relative to the working directory
 * @param approvedBy who the resulting {@code APPROVED} versions are attributed to. Running the
 *        bootstrap *is* the approval action, so this records that it was a local operator rather
 *        than leaving the audit trail blank
 * @param exitAfterBootstrap shut the application down once the corpus is loaded, so the bootstrap
 *        can be a one-shot command instead of a server that happens to have indexed something
 */
@ConfigurationProperties(prefix = "aura.bootstrap")
public record BootstrapProperties(
        boolean publicKnowledge,
        String sourceDirectory,
        String approvedBy,
        boolean exitAfterBootstrap) {
}
