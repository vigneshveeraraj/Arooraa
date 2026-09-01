package com.arooraa.aura.retrieval.context;

import com.arooraa.aura.knowledge.domain.KnowledgeSpaces;

/**
 * The knowledge spaces the retrieval/authorization side names (frozen A2 requirement: "common
 * Aura platform does NOT mean common searchable data").
 *
 * <p>Re-exports {@link KnowledgeSpaces}, whose values live in the knowledge domain next to the
 * column they describe — retrieval depends on knowledge, never the other way around, so there is
 * exactly one definition of each value rather than two kept in sync by convention (as in A2).
 */
public final class KnowledgeSpace {

    public static final String AROORAA_PUBLIC = KnowledgeSpaces.AROORAA_PUBLIC;

    private KnowledgeSpace() {
    }
}
