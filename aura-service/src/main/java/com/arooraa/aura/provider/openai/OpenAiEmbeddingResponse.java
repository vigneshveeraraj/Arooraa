package com.arooraa.aura.provider.openai;

import java.util.List;

/** OpenAI-specific — deliberately confined to this package (frozen architecture requirement). */
record OpenAiEmbeddingResponse(List<Item> data, String model) {

    record Item(List<Float> embedding, int index) {
    }
}
