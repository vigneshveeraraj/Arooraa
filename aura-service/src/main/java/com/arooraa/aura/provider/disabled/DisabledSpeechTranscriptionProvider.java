package com.arooraa.aura.provider.disabled;

import com.arooraa.aura.provider.ProviderDisabledException;
import com.arooraa.aura.provider.SpeechTranscriptionProvider;
import com.arooraa.aura.provider.TranscriptionRequest;
import com.arooraa.aura.provider.TranscriptionResult;

/** The default. Voice is off unless a deployment deliberately turns it on and supplies a key. */
public class DisabledSpeechTranscriptionProvider implements SpeechTranscriptionProvider {

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public TranscriptionResult transcribe(TranscriptionRequest request) {
        throw new ProviderDisabledException("Speech transcription provider is not configured.");
    }
}
