package com.arooraa.aura.retrieval.context;

/**
 * Which Aura experience is asking (extension point for the common Aura platform — see this
 * module's ARCHITECTURE.md / the A2 milestone brief's "common platform" clarification: Aura is
 * not exclusively the arooraa.com chatbot). A plain value, not an enum: future profiles (MESA
 * Aura, Mindra Aura, ...) are added as new constants here without touching {@link AccessPolicy}
 * implementations' method signatures. A2 defines exactly one.
 *
 *
 * @see com.arooraa.aura.retrieval.access.AccessPolicy
 */
public record AssistantProfile(String code) {

    public static final AssistantProfile AROORAA_WEBSITE = new AssistantProfile("AROORAA_WEBSITE");
}
