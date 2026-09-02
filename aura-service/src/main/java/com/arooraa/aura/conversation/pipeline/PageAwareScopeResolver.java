package com.arooraa.aura.conversation.pipeline;

import com.arooraa.aura.conversation.domain.ConversationMode;
import org.springframework.stereotype.Component;

/**
 * Pipeline stage 3.5 (A4.1). Fixes the page-awareness defect: {@code currentPath=/products/mesa}
 * plus "Tell me more about this." was classified {@link ConversationMode#GENERAL_CONSULTING} with
 * no evidence, because the message names no organisation subject and {@link ScopeClassifier} has
 * no way to know what "this" refers to.
 *
 * <p>This stage only ever narrows a fallback, never a deliberate routing decision. It fires
 * exactly when three things are all true: the classifier's own verdict was one of the two
 * "nothing to look up" outcomes — {@link ConversationMode#GENERAL_CONSULTING} (the catch-all
 * reached only when the message named no organisation subject and matched no other rule), or
 * {@link ConversationMode#PROJECT_DISCOVERY} without {@link ScopeDecision#mentionsOrganisationSubject()}
 * (the same "opener has nothing to look up" case {@code RetrievalPlanner} already skips retrieval
 * for, reached when a weak discovery word like "existing application" appears with nothing naming
 * us) — the message is a {@link ContextualReferenceDetector contextual reference} such as "tell me
 * more about this", and {@code currentPath} resolves to a known public subject through
 * {@link PageContextRegistry}. The second branch matters in practice: "How could this help my
 * existing application?" on the Application Modernization service page contains "existing
 * application", one of {@code ScopeClassifier}'s own weak discovery markers, and is
 * {@code PROJECT_DISCOVERY} before this stage ever runs — without this branch the service-page
 * case in the finding would never reach the override. Every mode with a real signal behind it —
 * including {@link ConversationMode#INTERNAL_BOUNDARY}, decided before either eligible mode can
 * ever be reached, and {@code PROJECT_DISCOVERY} that does name us — is untouched by construction,
 * since this only ever reads a decision that already is one of the two eligible outcomes.
 *
 * <p>{@code currentPath} still grants nothing on its own: an unrecognised path resolves to no
 * subject (see {@link PageContextRegistry}), and this stage then changes nothing.
 *
 * <p>The visitor's own words are never rewritten — {@code rawMessage} continues to be what is
 * stored in the transcript and what the model sees as the user's turn. Only the internal retrieval
 * query is contextualized, and deliberately replaced rather than appended to: retrieval's whole
 * question is "find evidence about the subject", and "Tell me about MESA" finds it far more
 * reliably than "Tell me more about this. MESA" — the pronoun and its surrounding filler words are
 * exactly the kind of generic, subject-diluting text a bag-of-words query embedding scores worst,
 * so keeping them alongside the resolved name would still leave the same query mostly unfixed.
 */
@Component
public class PageAwareScopeResolver {

    /** @param scope the (possibly overridden) scope decision retrieval and generation should use
     *  @param retrievalQuery the text retrieval should search for — contextualized only when this
     *         stage fired; otherwise identical to the visitor's message
     *  @param resolvedSubject the canonical subject this turn was resolved to, or {@code null}
     */
    public record Resolution(ScopeDecision scope, String retrievalQuery, String resolvedSubject) {

        private static Resolution unchanged(ScopeDecision scope, String message) {
            return new Resolution(scope, message, null);
        }
    }

    public Resolution resolve(ScopeDecision scope, String message, String currentPath) {
        if (!isEligibleFallback(scope)) {
            return Resolution.unchanged(scope, message);
        }
        if (!ContextualReferenceDetector.isContextualReference(message)) {
            return Resolution.unchanged(scope, message);
        }
        return PageContextRegistry.resolve(currentPath)
                .map(subject -> new Resolution(
                        new ScopeDecision(ConversationMode.GROUNDED_QA, scope.confidentiality(), true),
                        "Tell me about " + subject.name(),
                        subject.name()))
                .orElseGet(() -> Resolution.unchanged(scope, message));
    }

    private boolean isEligibleFallback(ScopeDecision scope) {
        if (scope.mode() == ConversationMode.GENERAL_CONSULTING) {
            return true;
        }
        return scope.mode() == ConversationMode.PROJECT_DISCOVERY && !scope.mentionsOrganisationSubject();
    }
}
