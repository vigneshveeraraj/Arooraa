package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.config.ChatProperties;
import com.arooraa.aura.conversation.domain.ConversationMode;
import com.arooraa.aura.conversation.domain.ConversationTone;
import com.arooraa.aura.conversation.domain.Language;
import com.arooraa.aura.conversation.domain.MessageRole;
import com.arooraa.aura.conversation.policy.AuraPolicy;
import com.arooraa.aura.conversation.policy.PromptSection;
import com.arooraa.aura.conversation.profile.AssistantProfileDefinition;
import com.arooraa.aura.provider.ChatMessage;
import com.arooraa.aura.retrieval.Evidence;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Pipeline stage 10. Assembles the system instruction from ordered {@link PromptSection}s and
 * builds the provider-neutral message list.
 *
 * <p>Composition, not concatenation: each section comes from {@link AuraPolicy} and covers exactly
 * one concern, and the set of sections present is itself a security property. A boundary turn
 * carries no evidence section because none was retrieved, so "the prompt contains no corpus text"
 * is a structural fact about this method rather than a promise about its wording.
 *
 * <p>Evidence is rendered with only the fields grounding needs — title, section heading, text.
 * Similarity scores, ranks, chunk ids and knowledge spaces are withheld: the model has no use for
 * retrieval internals and every fact in the prompt is a fact that can end up in an answer.
 */
@Component
public class PromptComposer {

    private final ChatProperties properties;

    public PromptComposer(ChatProperties properties) {
        this.properties = properties;
    }

    public ComposedPrompt compose(AssistantProfileDefinition profile,
                                   ConversationMode mode,
                                   Language language,
                                   ConversationTone tone,
                                   GenerationDecision decision,
                                   List<Evidence> evidence,
                                   ConversationContext context,
                                   String currentPath,
                                   String userMessage) {
        String organisation = profile.organisation();

        List<PromptSection> policySections = new ArrayList<>();
        policySections.add(AuraPolicy.identity(organisation));
        policySections.add(profileSection(profile));
        policySections.add(AuraPolicy.personality(tone, decision.humourAllowed()));
        policySections.add(AuraPolicy.confidentiality(organisation));
        policySections.add(AuraPolicy.mode(mode, organisation));
        policySections.add(AuraPolicy.grounding(organisation, decision.groundingAllowed(), decision.mustQualify(),
                decision.forbidArooraaFactualClaims()));
        policySections.add(AuraPolicy.language(language));
        if (currentPath != null && !currentPath.isBlank()) {
            policySections.add(pageContextSection(currentPath));
        }
        policySections.add(AuraPolicy.safety(properties.maxResponseChars()));

        String policyText = render(policySections);
        // Evidence is appended after the policy rather than mixed into it, so policyText stays
        // exactly "the instructions" for the guardrail's leak check (see ComposedPrompt).
        String systemText = decision.groundingAllowed() && !evidence.isEmpty()
                ? policyText + "\n\n" + evidenceSection(evidence).render()
                : policyText;

        List<ChatMessage> messages = new ArrayList<>();
        messages.add(new ChatMessage("system", systemText));
        for (ConversationContext.Turn turn : context.turns()) {
            messages.add(new ChatMessage(turn.role() == MessageRole.USER ? "user" : "assistant", turn.content()));
        }
        messages.add(new ChatMessage("user", userMessage));

        return new ComposedPrompt(systemText, policyText, List.copyOf(messages));
    }

    private String render(List<PromptSection> sections) {
        return sections.stream().map(PromptSection::render).reduce((a, b) -> a + "\n\n" + b).orElse("");
    }

    private PromptSection profileSection(AssistantProfileDefinition profile) {
        return new PromptSection("Where you are", """
                You are answering on %s. Visitors here are the public: potential clients, people
                with an idea, people comparing options, and people just looking around.
                """.formatted(profile.description()));
    }

    private PromptSection evidenceSection(List<Evidence> evidence) {
        StringBuilder body = new StringBuilder("""
                Approved material for this turn. This is the only source for anything you state
                about us:

                """);
        int index = 0;
        for (Evidence item : evidence) {
            index++;
            body.append(index).append(". ").append(item.documentTitle());
            if (item.sectionHeading() != null && !item.sectionHeading().isBlank()) {
                body.append(" — ").append(item.sectionHeading());
            }
            body.append('\n').append(item.text().strip()).append("\n\n");
        }
        return new PromptSection("Approved material", body.toString());
    }

    /**
     * Page context is context only. It tells Aura what the visitor is probably looking at so a
     * follow-up like "does this work for a café?" makes sense — it grants no access, and the
     * retrieval boundary neither reads it nor changes because of it.
     */
    private PromptSection pageContextSection(String currentPath) {
        return new PromptSection("Where they are looking", """
                The visitor is on the page %s. Use that as a hint about what they mean, nothing
                more — it does not tell you anything about who they are or what they may see.
                """.formatted(currentPath));
    }
}
