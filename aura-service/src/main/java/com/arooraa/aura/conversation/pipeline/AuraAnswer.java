package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.ConversationTone;
import com.arooraa.aura.conversation.domain.Language;
import com.arooraa.aura.retrieval.EvidenceLevel;

import java.util.List;
import java.util.UUID;

/**
 * One completed turn, as the pipeline finished it. The API layer decides how much of this a given
 * caller may see: the answer and its sources are always safe, while mode/evidence/tone/latency are
 * developer diagnostics and are only exposed when {@code aura.chat.diagnostics-enabled} is on.
 *
 * @param guardrailViolation which output check fired, if any — diagnostics only, never rendered
 *        into the conversation
 * @param recognisedEntities which approved AROORAA public names this turn was understood to be
 *        about (A5.2). Names only, never the confidence behind them, and diagnostics only — a
 *        visitor is shown an answer, not a report on how their question was parsed
 */
public record AuraAnswer(
        UUID conversationId,
        /**
         * Which turn this is, within its conversation. Public because feedback has to name the
         * answer it is about, and a client cannot be expected to infer that from the order things
         * arrived in.
         */
        int sequence,
        String answer,
        ConversationMode mode,
        EvidenceLevel evidenceLevel,
        List<SourceReference> sources,
        Language language,
        ConversationTone tone,
        long latencyMs,
        String guardrailViolation,
        List<String> recognisedEntities) {
}
