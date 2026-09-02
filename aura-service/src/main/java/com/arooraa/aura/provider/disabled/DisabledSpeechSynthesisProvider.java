package com.arooraa.aura.provider.disabled;

import com.arooraa.aura.provider.ProviderDisabledException;
import com.arooraa.aura.provider.SpeechSynthesisProvider;
import com.arooraa.aura.provider.SynthesisRequest;
import com.arooraa.aura.provider.SynthesisResult;

/** The default — see {@link DisabledSpeechTranscriptionProvider}. */
public class DisabledSpeechSynthesisProvider implements SpeechSynthesisProvider {

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public SynthesisResult synthesize(SynthesisRequest request) {
        throw new ProviderDisabledException("Speech synthesis provider is not configured.");
    }
}
