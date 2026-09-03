package com.arooraa.aura.discovery.api;

import com.arooraa.aura.discovery.ProjectDiscoveryService;
import com.arooraa.aura.discovery.handoff.HandoffContact;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * The brief's wire contract. Everything a client receives here is either the visitor's own words or
 * a flag about what they may do next; there is no field for a score, a model name, a prompt, or
 * anything about how the brief was produced.
 */
public final class BriefDtos {

    private BriefDtos() {
    }

    /**
     * @param readyToSummarise whether enough has been said to be worth summarising. The client uses
     *        it to decide whether to offer the summary at all, so the offer never appears one
     *        sentence into a conversation
     * @param handoffAvailable whether Aura can create an enquiry from here. False is not an error:
     *        the conversation and the summary work regardless
     * @param enquiryReference present only once an enquiry exists, and then the thing to show
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record BriefResponse(
            Fields fields,
            String status,
            boolean readyToSummarise,
            boolean handoffAvailable,
            String enquiryReference) {

        static BriefResponse from(ProjectDiscoveryService.BriefView view) {
            return new BriefResponse(
                    Fields.from(view.fields()),
                    view.status().name(),
                    view.readyToSummarise(),
                    view.handoffAvailable(),
                    view.enquiryReference());
        }
    }

    /**
     * The brief itself. Nulls are meaningful — they say Aura does not know — so they are sent as
     * absent fields rather than as empty strings, and a client renders only what is there.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Fields(
            String problemStatement,
            String targetUsers,
            String currentSituation,
            String desiredOutcome,
            List<String> proposedCapabilities,
            List<String> platforms,
            List<String> integrations,
            String aiAutomationNeeds,
            String existingSystems,
            String constraints,
            String timeline,
            List<String> unknowns,
            String conversationSummary) {

        static Fields from(com.arooraa.aura.discovery.domain.ProjectBriefFields fields) {
            return new Fields(
                    fields.problemStatement(),
                    fields.targetUsers(),
                    fields.currentSituation(),
                    fields.desiredOutcome(),
                    emptyToNull(fields.proposedCapabilities()),
                    emptyToNull(fields.platforms()),
                    emptyToNull(fields.integrations()),
                    fields.aiAutomationNeeds(),
                    fields.existingSystems(),
                    fields.constraints(),
                    fields.timeline(),
                    emptyToNull(fields.unknowns()),
                    fields.conversationSummary());
        }

        private static List<String> emptyToNull(List<String> values) {
            return values == null || values.isEmpty() ? null : values;
        }
    }

    /**
     * @param consent required, and required to be {@code true}. Declared as a boxed {@code Boolean}
     *        with {@code @NotNull} rather than a primitive so that omitting it is a validation
     *        failure the visitor is told about, instead of silently defaulting to false and looking
     *        like a refusal
     */
    public record HandoffRequest(@NotNull Boolean consent, @Valid @NotNull HandoffContact contact) {
    }

    public record HandoffResponse(String enquiryReference) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ErrorResponse(String code, String message, String field) {

        public ErrorResponse(String code, String message) {
            this(code, message, null);
        }
    }
}
