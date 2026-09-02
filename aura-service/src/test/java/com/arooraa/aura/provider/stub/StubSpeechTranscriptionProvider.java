package com.arooraa.aura.provider.stub;

import com.arooraa.aura.provider.ProviderDisabledException;
import com.arooraa.aura.provider.SpeechTranscriptionProvider;
import com.arooraa.aura.provider.TranscriptionRequest;
import com.arooraa.aura.provider.TranscriptionResult;

import java.util.ArrayDeque;
import java.util.Deque;

/**
 * Deterministic, test-only speech-to-text — the same bargain as {@link StubChatGenerationProvider}:
 * the whole suite runs with no key, no network and no bill, and a fake that lives under
 * {@code src/test} cannot be enabled in production by accident.
 *
 * <p>Records the request, because most of what matters about the voice path is what was sent
 * rather than what came back: that the filename was ours, that no language was forced, that the
 * bytes were the ones uploaded.
 */
public class StubSpeechTranscriptionProvider implements SpeechTranscriptionProvider {

    private final Deque<String> scripted = new ArrayDeque<>();
    private final Deque<RuntimeException> failures = new ArrayDeque<>();
    private volatile TranscriptionRequest lastRequest;
    private volatile boolean enabled = true;

    /** Queues what the next recording "says". */
    public void hears(String text) {
        scripted.add(text);
    }

    public void failNextWith(RuntimeException failure) {
        failures.add(failure);
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public TranscriptionRequest lastRequest() {
        return lastRequest;
    }

    public void reset() {
        scripted.clear();
        failures.clear();
        lastRequest = null;
        enabled = true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public TranscriptionResult transcribe(TranscriptionRequest request) {
        if (!enabled) {
            throw new ProviderDisabledException("speech transcription");
        }
        this.lastRequest = request;
        if (!failures.isEmpty()) {
            throw failures.poll();
        }
        String text = scripted.isEmpty() ? "Hello Aura" : scripted.poll();
        return new TranscriptionResult(text, null);
    }
}
