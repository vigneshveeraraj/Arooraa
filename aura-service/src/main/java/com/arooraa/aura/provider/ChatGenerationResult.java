package com.arooraa.aura.provider;

/** Token counts are nullable — not every provider reports them. */
public record ChatGenerationResult(String content, String model, Integer promptTokens, Integer completionTokens) {
}
