package com.arooraa.aura.knowledge.domain;

/**
 * Canonical values for {@link AuraDocument#getKnowledgeSpace()} — which searchable corpus a
 * document belongs to. Plain string constants, not an enum: future spaces are inherently
 * dynamic/parameterized (e.g. {@code MESA_TENANT_<id>}, {@code MINDRA_USER_<id>}) and can't be
 * enumerated in code.
 *
 * <p>Lives in the knowledge domain, next to the column it describes, because that is what a
 * knowledge space is a property of. {@code retrieval.context.KnowledgeSpace} re-exports
 * {@link #AROORAA_PUBLIC} for the authorization side rather than defining its own copy — A2 kept
 * the two in sync by convention, which is now a single definition instead.
 */
public final class KnowledgeSpaces {

    /** Approved public AROORAA facts — the corpus the website Aura may cite to a visitor. */
    public static final String AROORAA_PUBLIC = "AROORAA_PUBLIC";

    /**
     * Aura's own operating policy (personality, confidentiality, conversation, unknown-answer,
     * discovery and handoff rules). Deliberately a separate space from public knowledge: policy
     * governs how Aura behaves and is consumed by a future prompt/policy layer, it is never
     * evidence to cite back to a visitor. Keeping it out of {@link #AROORAA_PUBLIC} means it stays
     * unretrievable through the public path even if a policy document were ever mis-labelled
     * {@code PUBLIC} — two independent controls rather than one.
     */
    public static final String AURA_POLICY = "AURA_POLICY";

    private KnowledgeSpaces() {
    }
}
