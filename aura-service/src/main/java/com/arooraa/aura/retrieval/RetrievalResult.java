package com.arooraa.aura.retrieval;

import java.util.List;

public record RetrievalResult(String query, EvidenceLevel evidenceLevel, List<Evidence> evidence) {
}
