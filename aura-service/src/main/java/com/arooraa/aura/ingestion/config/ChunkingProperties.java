package com.arooraa.aura.ingestion.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Backed by {@code aura.ingestion.chunking.*} — configurable target chunk size and overlap
 * (frozen A2 requirement: "configurable target size, configurable overlap where useful"), rather
 * than hardcoded constants.
 */
@ConfigurationProperties(prefix = "aura.ingestion.chunking")
public record ChunkingProperties(int targetChars, int overlapChars) {
}
