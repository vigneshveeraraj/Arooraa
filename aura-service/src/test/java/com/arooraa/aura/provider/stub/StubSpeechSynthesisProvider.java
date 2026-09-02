package com.arooraa.aura.provider.stub;

import com.arooraa.aura.provider.ProviderDisabledException;
import com.arooraa.aura.provider.SpeechSynthesisProvider;
import com.arooraa.aura.provider.SynthesisRequest;
import com.arooraa.aura.provider.SynthesisResult;

import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Deque;

/**
 * Deterministic, test-only text-to-speech. Returns the text it was given as bytes, which makes the
 * assertion that matters trivially checkable: what was spoken is exactly what was displayed.
 */
public class StubSpeechSynthesisProvider implements SpeechSynthesisProvider {

    private final Deque<RuntimeException> failures = new ArrayDeque<>();
    private volatile SynthesisRequest lastRequest;
    private volatile boolean enabled = true;

    public void failNextWith(RuntimeException failure) {
        failures.add(failure);
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public SynthesisRequest lastRequest() {
        return lastRequest;
    }

    /** What this provider was actually asked to say, as text. */
    public String lastSpokenText() {
        return lastRequest == null ? null : lastRequest.text();
    }

    public void reset() {
        failures.clear();
        lastRequest = null;
        enabled = true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public SynthesisResult synthesize(SynthesisRequest request) {
        if (!enabled) {
            throw new ProviderDisabledException("speech synthesis");
        }
        this.lastRequest = request;
        if (!failures.isEmpty()) {
            throw failures.poll();
        }
        return new SynthesisResult(request.text().getBytes(StandardCharsets.UTF_8), "audio/mpeg");
    }
}
