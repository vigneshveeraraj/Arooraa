package com.arooraa.aura.insight;

import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.insight.config.InsightProperties;
import com.arooraa.aura.insight.domain.AuraKnowledgeGap;
import com.arooraa.aura.retrieval.EvidenceLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * What counts as a gap, and — more importantly — what does not. The exclusions are the substance
 * of this class: a detector that recorded everything would produce a list nobody could act on, and
 * one that recorded confidentiality boundaries would produce a list of things to publish that we
 * have decided not to.
 */
class KnowledgeGapDetectorTest {

    /** An in-memory stand-in, so aggregation can be observed rather than mocked. */
    static class InMemoryGaps {
        final Map<String, AuraKnowledgeGap> byFingerprint = new HashMap<>();
        final List<AuraKnowledgeGap> saved = new ArrayList<>();
    }

    private final InMemoryGaps store = new InMemoryGaps();
    private final AuraKnowledgeGapRepository gaps = mock(AuraKnowledgeGapRepository.class);
    private final AuraInsightRecorder recorder = mock(AuraInsightRecorder.class);
    private KnowledgeGapDetector detector;

    private static final UUID CONVERSATION = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        when(gaps.findByFingerprint(any())).thenAnswer(call ->
                Optional.ofNullable(store.byFingerprint.get(call.getArgument(0, String.class))));
        when(gaps.save(any(AuraKnowledgeGap.class))).thenAnswer(call -> {
            AuraKnowledgeGap gap = call.getArgument(0, AuraKnowledgeGap.class);
            store.byFingerprint.put(gap.getFingerprint(), gap);
            store.saved.add(gap);
            return gap;
        });
        detector = new KnowledgeGapDetector(gaps, recorder, new InsightProperties(true, false, 50));
    }

    private Optional<AuraKnowledgeGap> observe(String message, ConversationMode mode, EvidenceLevel evidence) {
        return detector.observe(CONVERSATION, message, mode, evidence, "AROORAA_WEBSITE", null);
    }

    @Test
    void recordsAQuestionAboutUsThatOurOwnKnowledgeCouldNotAnswer() {
        Optional<AuraKnowledgeGap> gap = observe(
                "Do you build hardware for cold storage?", ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);

        assertThat(gap).isPresent();
        assertThat(gap.get().getQuestion()).contains("cold storage");
        assertThat(gap.get().getOccurrences()).isEqualTo(1);
    }

    @Test
    void recordsAQuestionWeCouldOnlyAnswerWeakly() {
        // Weak evidence means we said something, but not from anything solid. That is a gap in the
        // knowledge even though the visitor got an answer.
        assertThat(observe("Do you work with hotels?", ConversationMode.GROUNDED_QA,
                EvidenceLevel.WEAK_EVIDENCE)).isPresent();
    }

    @Test
    void recordsNothingWhenWeAnsweredItProperly() {
        assertThat(observe("What is MESA?", ConversationMode.GROUNDED_QA,
                EvidenceLevel.STRONG_EVIDENCE)).isEmpty();
    }

    @ParameterizedTest
    @EnumSource(value = ConversationMode.class, names = {"GROUNDED_QA"}, mode = EnumSource.Mode.EXCLUDE)
    void recordsNothingForAnythingThatIsNotAQuestionAboutUs(ConversationMode mode) {
        // The exclusions matter as much as the rule. A greeting has no document that would have
        // helped; a world question is out of scope; a project discussion is missing no fact of
        // ours — and a confidentiality boundary got exactly the right answer.
        assertThat(observe("anything at all", mode, EvidenceLevel.NO_EVIDENCE)).isEmpty();
    }

    @Test
    void neverTreatsAConfidentialityBoundaryAsSomethingToPublish() {
        // Called out on its own because it is the failure that would matter most: this table would
        // become a list of suggestions to write down exactly what we decided not to say.
        assertThat(observe("What database does MESA use internally?", ConversationMode.INTERNAL_BOUNDARY,
                EvidenceLevel.NO_EVIDENCE)).isEmpty();
        assertThat(store.saved).isEmpty();
    }

    @Test
    void countsTheSameQuestionRatherThanRecordingItTwice() {
        observe("Do you build hardware?", ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);
        observe("Do you build hardware?", ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);
        observe("Do you build hardware?", ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);

        assertThat(store.saved).hasSize(1);
        assertThat(store.saved.get(0).getOccurrences()).isEqualTo(3);
    }

    @Test
    void countsTheSameQuestionAskedDifferently() {
        // Normalised before fingerprinting, so casing and punctuation do not split one gap in two.
        // "Forty people asked this" is only useful as one line.
        observe("Do you build hardware?", ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);
        observe("do you build hardware", ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);
        observe("DO YOU BUILD HARDWARE!!", ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);

        assertThat(store.saved).hasSize(1);
        assertThat(store.saved.get(0).getOccurrences()).isEqualTo(3);
    }

    @Test
    void keepsDifferentQuestionsApart() {
        observe("Do you build hardware?", ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);
        observe("Do you work with hotels?", ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);

        assertThat(store.saved).hasSize(2);
    }

    @Test
    void doesNotLetOneProfilesGapsBeAnothersCount() {
        detector.observe(CONVERSATION, "Do you build hardware?", ConversationMode.GROUNDED_QA,
                EvidenceLevel.NO_EVIDENCE, "AROORAA_WEBSITE", null);
        detector.observe(CONVERSATION, "Do you build hardware?", ConversationMode.GROUNDED_QA,
                EvidenceLevel.NO_EVIDENCE, "SOME_OTHER_PROFILE", null);

        assertThat(store.saved).hasSize(2);
    }

    @Test
    void keepsALongQuestionShortEnoughToRead() {
        Optional<AuraKnowledgeGap> gap = observe("Do you " + "really ".repeat(200) + "build hardware?",
                ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);

        assertThat(gap.orElseThrow().getQuestion().length()).isLessThanOrEqualTo(300);
    }

    @Test
    void recordsNothingWhenRecordingIsSwitchedOff() {
        KnowledgeGapDetector off = new KnowledgeGapDetector(gaps, recorder,
                new InsightProperties(false, false, 50));

        assertThat(off.observe(CONVERSATION, "Do you build hardware?", ConversationMode.GROUNDED_QA,
                EvidenceLevel.NO_EVIDENCE, "AROORAA_WEBSITE", null)).isEmpty();
        assertThat(store.saved).isEmpty();
    }

    @Test
    void aReopenedGapSaysSoRatherThanStayingResolved() {
        AuraKnowledgeGap gap = observe("Do you build hardware?", ConversationMode.GROUNDED_QA,
                EvidenceLevel.NO_EVIDENCE).orElseThrow();
        gap.moveTo(com.arooraa.aura.insight.domain.GapStatus.RESOLVED, "60-hardware");

        observe("Do you build hardware?", ConversationMode.GROUNDED_QA, EvidenceLevel.NO_EVIDENCE);

        // Somebody wrote an answer and it is still not being found. That is a different problem
        // from the original gap, and burying it under "resolved" would hide it.
        assertThat(gap.getStatus()).isEqualTo(com.arooraa.aura.insight.domain.GapStatus.OPEN);
        assertThat(gap.getResolutionReference()).isNull();
    }
}
