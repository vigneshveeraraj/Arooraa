package com.arooraa.aura.ingestion;

/** State of one {@link AuraIngestionJob} run — chunking + embedding a single document version. */
public enum IngestionJobStatus {
    PENDING,
    RUNNING,
    SUCCEEDED,
    FAILED
}
