package com.arooraa.aura.knowledge.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.UUID;

/**
 * The stable identity of one knowledge document (e.g. "01-company-overview") — never itself
 * carries content or status; every fact lives on a {@link AuraDocumentVersion}, exactly one of
 * which may be {@code active} at a time (enforced by a partial unique index in Flyway, not here
 * — see V1). This is what makes historical versions auditable without a document "losing" its
 * identity every time its content changes.
 */
@Entity
@Table(name = "aura_documents")
public class AuraDocument {

    @Id
    private UUID id;

    /** Stable, human-readable identity — matches the knowledge-seed filename (e.g. "10-mesa"). */
    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /** Broad grouping (e.g. "company", "product", "service", "policy") — free text, not an enum: the taxonomy is expected to grow with the knowledge base. */
    @Column(name = "domain", length = 50)
    private String domain;

    @Column(name = "category", length = 50)
    private String category;

    /** Set only when this document is about a specific AROORAA product (e.g. "MESA"). */
    @Column(name = "product", length = 50)
    private String product;

    /** Set only when this document is about a specific AROORAA service line. */
    @Column(name = "service", length = 50)
    private String service;

    /**
     * Which searchable corpus this document belongs to (see {@code retrieval.context.KnowledgeSpace}
     * / {@code AccessPolicy}) — A2 extension point for the common Aura platform serving multiple
     * future experiences (MESA, Mindra, ...) without sharing one unrestricted vector corpus. Plain
     * text for the same reason as domain/category/product/service above.
     */
    @Column(name = "knowledge_space", nullable = false, length = 50)
    private String knowledgeSpace;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected AuraDocument() {
    }

    /** Defaults to the {@code AROORAA_PUBLIC} knowledge space — every A0/A1 call site stays valid unchanged. */
    public AuraDocument(String slug, String title, String domain, String category, String product, String service) {
        this(slug, title, domain, category, product, service, KnowledgeSpaces.AROORAA_PUBLIC);
    }

    public AuraDocument(String slug, String title, String domain, String category, String product, String service,
                         String knowledgeSpace) {
        this.id = UUID.randomUUID();
        this.slug = slug;
        this.title = title;
        this.domain = domain;
        this.category = category;
        this.product = product;
        this.service = service;
        this.knowledgeSpace = knowledgeSpace;
    }

    /**
     * Applies corrected editorial metadata from a re-import. These fields are unversioned by
     * design (identity, not content) but several of them — title, product, service — are searched
     * directly by lexical retrieval, so leaving them stale after the source changed (A2's
     * behaviour) meant the index disagreed with the approved source. The content change itself is
     * still versioned separately; this only keeps the document's own metadata truthful.
     *
     * @return true if anything actually changed
     */
    public boolean updateEditorialMetadata(String title, String domain, String category, String product,
                                            String service, String knowledgeSpace) {
        if (equal(this.title, title) && equal(this.domain, domain) && equal(this.category, category)
                && equal(this.product, product) && equal(this.service, service)
                && equal(this.knowledgeSpace, knowledgeSpace)) {
            return false;
        }
        this.title = title;
        this.domain = domain;
        this.category = category;
        this.product = product;
        this.service = service;
        this.knowledgeSpace = knowledgeSpace;
        return true;
    }

    private static boolean equal(String left, String right) {
        return left == null ? right == null : left.equals(right);
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public String getDomain() {
        return domain;
    }

    public String getCategory() {
        return category;
    }

    public String getProduct() {
        return product;
    }

    public String getService() {
        return service;
    }

    public String getKnowledgeSpace() {
        return knowledgeSpace;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
