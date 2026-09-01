package com.arooraa.aura.conversation.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Backed by {@code aura.chat.*}. Every limit here is a safety limit as much as a cost limit — an
 * unbounded history or response is how a chat surface turns into an unbounded bill and an
 * unbounded blast radius at the same time.
 *
 * @param enabled whether the local chat API and manual test page exist at all. Default false: A3
 *        is a local manual-acceptance milestone, and a public chat surface is explicitly out of
 *        scope until arooraa.com integration is approved
 * @param diagnosticsEnabled whether responses carry the developer diagnostics block (mode,
 *        evidence level, language, tone, latency). Separate from {@code enabled} so a shared local
 *        run can expose chat without exposing internals; never on by default
 * @param maxHistoryMessages how many past turns are replayed to the model — bounded session
 *        memory, not permanent personal memory
 * @param maxHistoryChars a second, independent cap: a handful of very long turns can exceed a
 *        sane prompt size well before the message count does
 * @param maxResponseChars hard ceiling on a generated answer, enforced after generation by the
 *        output guardrail
 * @param maxSources how many public source references a grounded answer may cite
 * @param temperature sampling temperature for the chat provider — warm enough to sound human,
 *        low enough not to wander off the evidence
 * @param maxOutputTokens provider-side output cap, the bound that stops a runaway generation
 *        before it is ever produced (as opposed to {@code maxResponseChars}, which trims after)
 */
@ConfigurationProperties(prefix = "aura.chat")
public record ChatProperties(
        boolean enabled,
        boolean diagnosticsEnabled,
        int maxHistoryMessages,
        int maxHistoryChars,
        int maxResponseChars,
        int maxSources,
        double temperature,
        int maxOutputTokens) {
}
