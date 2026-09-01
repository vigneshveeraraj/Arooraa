package com.arooraa.aura.retrieval.search;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * PostgreSQL-native full-text search across chunk text/section heading and document
 * title/product/service (frozen A2 requirement: keep lexical search simple and Postgres-native,
 * no Elasticsearch/OpenSearch). Two separate {@code to_tsvector(...)} expressions — one per table
 * — rather than one expression over joined columns, so each has its own matching GIN index (V2);
 * a cross-table expression can't be indexed directly. Same eligibility boundary as
 * {@link VectorSearchRepository}, enforced in SQL.
 */
@Repository
public class LexicalSearchRepository {

    private static final String SQL = """
            SELECT c.id AS chunk_id,
                   ts_rank(to_tsvector('english', coalesce(c.section_heading, '') || ' ' || c.content), plainto_tsquery('english', :query))
                   + ts_rank(to_tsvector('english', coalesce(d.title, '') || ' ' || coalesce(d.product, '') || ' ' || coalesce(d.service, '')), plainto_tsquery('english', :query))
                   AS rank
            FROM aura_chunks c
            JOIN aura_document_versions v ON v.id = c.document_version_id
            JOIN aura_documents d ON d.id = v.document_id
            WHERE v.active = true
              AND v.visibility = 'PUBLIC'
              AND v.status = 'INDEXED'
              AND d.knowledge_space IN (:knowledgeSpaces)
              AND (
                to_tsvector('english', coalesce(c.section_heading, '') || ' ' || c.content) @@ plainto_tsquery('english', :query)
                OR to_tsvector('english', coalesce(d.title, '') || ' ' || coalesce(d.product, '') || ' ' || coalesce(d.service, '')) @@ plainto_tsquery('english', :query)
              )
            ORDER BY rank DESC
            LIMIT :limit
            """;

    private final EntityManager entityManager;

    public LexicalSearchRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @SuppressWarnings("unchecked")
    public List<LexicalHit> search(String queryText, Collection<String> knowledgeSpaces, int limit) {
        Query query = entityManager.createNativeQuery(SQL)
                .setParameter("query", queryText)
                .setParameter("knowledgeSpaces", knowledgeSpaces)
                .setParameter("limit", limit);

        List<Object[]> rows = query.getResultList();
        return rows.stream()
                .map(row -> new LexicalHit(UUID.fromString(row[0].toString()), ((Number) row[1]).doubleValue()))
                .toList();
    }
}
