package com.arooraa.aura.retrieval.search;

import com.arooraa.aura.knowledge.persistence.VectorLiteral;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Cosine-similarity search over {@code aura_embeddings}, joined out to enforce the retrieval
 * eligibility boundary directly in SQL (Phase A0/A1 security requirement, extended in A2 with
 * knowledge-space authorization): only chunks belonging to a document version that is
 * {@code active}, {@code visibility = PUBLIC}, {@code status = INDEXED}, and whose document's
 * {@code knowledge_space} is in the caller's authorized set are ever candidates — enforced here,
 * not only by the caller filtering results afterward.
 */
@Repository
public class VectorSearchRepository {

    private static final String SQL = """
            SELECT c.id AS chunk_id, (e.embedding <=> CAST(:queryVector AS vector)) AS distance
            FROM aura_embeddings e
            JOIN aura_chunks c ON c.id = e.chunk_id
            JOIN aura_document_versions v ON v.id = c.document_version_id
            JOIN aura_documents d ON d.id = v.document_id
            WHERE v.active = true
              AND v.visibility = 'PUBLIC'
              AND v.status = 'INDEXED'
              AND d.knowledge_space IN (:knowledgeSpaces)
            ORDER BY distance ASC
            LIMIT :limit
            """;

    private final EntityManager entityManager;

    public VectorSearchRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @SuppressWarnings("unchecked")
    public List<VectorHit> search(float[] queryVector, Collection<String> knowledgeSpaces, int limit) {
        Query query = entityManager.createNativeQuery(SQL)
                .setParameter("queryVector", VectorLiteral.of(queryVector))
                .setParameter("knowledgeSpaces", knowledgeSpaces)
                .setParameter("limit", limit);

        List<Object[]> rows = query.getResultList();
        return rows.stream()
                .map(row -> new VectorHit(UUID.fromString(row[0].toString()), ((Number) row[1]).doubleValue()))
                .toList();
    }
}
