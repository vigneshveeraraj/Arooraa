package com.arooraa.aura.conversation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * A public source reference shown alongside a grounded answer. Holds only what a visitor may see —
 * document title, section heading, public URL. Document/version/chunk ids, knowledge space,
 * similarity scores and evidence text are deliberately not stored here, so reading this table back
 * out to a client needs no redaction step and can never drift into leaking retrieval internals.
 */
@Entity
@Table(name = "aura_message_sources")
public class AuraMessageSource {

    @Id
    private UUID id;

    @Column(name = "message_id", nullable = false)
    private UUID messageId;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "section_heading", length = 300)
    private String sectionHeading;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    protected AuraMessageSource() {
    }

    public AuraMessageSource(UUID messageId, int position, String title, String sectionHeading, String sourceUrl) {
        this.id = UUID.randomUUID();
        this.messageId = messageId;
        this.position = position;
        this.title = title;
        this.sectionHeading = sectionHeading;
        this.sourceUrl = sourceUrl;
    }

    public UUID getId() {
        return id;
    }

    public UUID getMessageId() {
        return messageId;
    }

    public int getPosition() {
        return position;
    }

    public String getTitle() {
        return title;
    }

    public String getSectionHeading() {
        return sectionHeading;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }
}
