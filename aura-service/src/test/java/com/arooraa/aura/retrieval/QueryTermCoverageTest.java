package com.arooraa.aura.retrieval;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QueryTermCoverageTest {

    @Test
    void fullyAnsweredQueryScoresOne() {
        double coverage = QueryTermCoverage.of("What is MESA?",
                "MESA is AROORAA's connected restaurant technology ecosystem.");

        assertEquals(1.0, coverage, 1e-9);
    }

    @Test
    void completelyUnrelatedEvidenceScoresZero() {
        double coverage = QueryTermCoverage.of("Who won the football World Cup?",
                "MESA is AROORAA's connected restaurant technology ecosystem.");

        assertEquals(0.0, coverage, 1e-9);
    }

    @Test
    void partiallyCoveredQueryScoresInBetween() {
        // "database" and "internally" are absent; "mesa" is present.
        double coverage = QueryTermCoverage.of("What database does MESA use internally?",
                "MESA connects dine-in, ordering, kitchen and staff operations into one system.");

        assertTrue(coverage > 0.0 && coverage < 0.5,
                "expected partial coverage but got " + coverage);
    }

    @Test
    void stopwordsDoNotInflateCoverage() {
        // Every word here except "capital" and "brazil" is a stopword; the passage has neither,
        // so coverage must be 0 rather than "most of the words matched".
        double coverage = QueryTermCoverage.of("Tell me the capital of Brazil.",
                "AROORAA turns ideas and business problems into production-ready digital products.");

        assertEquals(0.0, coverage, 1e-9);
    }

    @Test
    void prefixMatchingHandlesSimpleMorphology() {
        double coverage = QueryTermCoverage.of("Can AROORAA modernize an existing application?",
                "AROORAA's application modernization service renews existing systems.");

        assertTrue(coverage >= 0.75, "expected morphological variants to match, got " + coverage);
    }

    @Test
    void emptyOrStopwordOnlyQueryScoresZero() {
        assertEquals(0.0, QueryTermCoverage.of("", "anything"), 1e-9);
        assertEquals(0.0, QueryTermCoverage.of("what is the", "anything"), 1e-9);
    }

    @Test
    void emptyEvidenceScoresZero() {
        assertEquals(0.0, QueryTermCoverage.of("What is MESA?", ""), 1e-9);
    }

    @Test
    void tamilScriptTokensAreTreatedAsMeaningfulTerms() {
        var terms = QueryTermCoverage.meaningfulTerms("AROORAA என்ன மாதிரி company?");

        assertTrue(terms.contains("arooraa"));
        assertTrue(terms.contains("company"));
        assertTrue(terms.stream().anyMatch(t -> t.codePoints().anyMatch(c -> c >= 0x0B80 && c <= 0x0BFF)),
                "Tamil-script tokens must survive normalization, not be stripped");
    }

    @Test
    void tanglishQueryMatchesEnglishEvidenceOnSharedTokens() {
        double coverage = QueryTermCoverage.of("MESA restaurant-ku enna help pannum?",
                "MESA is a connected restaurant technology ecosystem.");

        assertTrue(coverage > 0.0, "shared Latin-script tokens should still contribute coverage");
    }
}
