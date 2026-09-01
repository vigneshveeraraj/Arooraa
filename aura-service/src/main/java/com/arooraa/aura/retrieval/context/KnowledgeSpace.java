package com.arooraa.aura.retrieval.context;

/**
 * Known values for {@code AuraDocument.knowledgeSpace} — the searchable-corpus isolation axis
 * (frozen A2 requirement: "common Aura platform does NOT mean common searchable data"). Plain
 * string constants, not an enum: future spaces are inherently dynamic/parameterized
 * (e.g. {@code MESA_TENANT_<id>}, {@code MINDRA_USER_<id>}) and can't be enumerated in code.
 *
 * <p>{@link #AROORAA_PUBLIC} must stay in sync with the literal used as
 * {@code AuraDocument}'s default-constructor value — {@code knowledge.domain} can't depend on
 * this (retrieval) package, so the two are kept consistent by convention, not by a shared
 * reference; {@code KnowledgeSpaceTest} asserts they match.
 */
public final class KnowledgeSpace {

    public static final String AROORAA_PUBLIC = "AROORAA_PUBLIC";

    private KnowledgeSpace() {
    }
}
