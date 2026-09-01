package com.arooraa.aura.knowledge.imports;

/** A knowledge-seed file failed to parse or is missing a required field — rejected safely, never partially imported. */
public class MalformedKnowledgeDocumentException extends RuntimeException {

    public MalformedKnowledgeDocumentException(String message) {
        super(message);
    }
}
