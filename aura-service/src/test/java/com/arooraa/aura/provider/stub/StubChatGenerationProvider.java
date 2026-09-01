package com.arooraa.aura.provider.stub;

import com.arooraa.aura.provider.ChatGenerationProvider;
import com.arooraa.aura.provider.ChatGenerationRequest;
import com.arooraa.aura.provider.ChatGenerationResult;
import com.arooraa.aura.provider.ChatMessage;
import com.arooraa.aura.provider.ProviderDisabledException;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

/**
 * Deterministic, test-only chat provider — the whole secretless suite runs on this, so no test
 * needs a key, a network, or a bill. Lives under {@code src/test} for the same reason as
 * {@link StubEmbeddingProvider}: a fake that cannot ship cannot be enabled in production by
 * accident.
 *
 * <p>Records what it was asked, which is most of its value: assertions like "a boundary turn's
 * prompt contains no corpus text" or "history reached the model in order" are about the request,
 * not the reply.
 */
public class StubChatGenerationProvider implements ChatGenerationProvider {

    private static final String DEFAULT_ANSWER =
            "Happy to help with that — tell me a little more about what you're working on.";

    private final Deque<String> scriptedReplies = new ArrayDeque<>();
    private final Deque<RuntimeException> scriptedFailures = new ArrayDeque<>();
    private volatile ChatGenerationRequest lastRequest;
    private volatile boolean enabled = true;

    /** Queues the next reply. Unqueued turns get a neutral, guardrail-clean default. */
    public void reply(String text) {
        scriptedReplies.add(text);
    }

    /** Queues a failure for the next call — used to prove provider outages degrade rather than break. */
    public void failNextWith(RuntimeException failure) {
        scriptedFailures.add(failure);
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public ChatGenerationRequest lastRequest() {
        return lastRequest;
    }

    /** The composed system instruction from the most recent call. */
    public String lastSystemPrompt() {
        if (lastRequest == null) {
            return null;
        }
        return lastRequest.messages().stream()
                .filter(message -> "system".equals(message.role()))
                .map(ChatMessage::content)
                .findFirst()
                .orElse(null);
    }

    /** Every message the model saw, in order — system, replayed history, then the current turn. */
    public List<ChatMessage> lastMessages() {
        return lastRequest == null ? List.of() : lastRequest.messages();
    }

    public void reset() {
        scriptedReplies.clear();
        scriptedFailures.clear();
        lastRequest = null;
        enabled = true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public ChatGenerationResult generate(ChatGenerationRequest request) {
        if (!enabled) {
            throw new ProviderDisabledException("chat generation");
        }
        this.lastRequest = request;
        if (!scriptedFailures.isEmpty()) {
            throw scriptedFailures.poll();
        }
        String content = scriptedReplies.isEmpty() ? DEFAULT_ANSWER : scriptedReplies.poll();
        return new ChatGenerationResult(content, "stub-chat-model", 0, 0);
    }
}
