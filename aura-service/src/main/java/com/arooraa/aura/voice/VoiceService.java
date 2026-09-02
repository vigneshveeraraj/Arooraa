package com.arooraa.aura.voice;

import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import com.arooraa.aura.provider.SpeechSynthesisProvider;
import com.arooraa.aura.provider.SpeechTranscriptionProvider;
import com.arooraa.aura.provider.SynthesisRequest;
import com.arooraa.aura.provider.SynthesisResult;
import com.arooraa.aura.provider.TranscriptionRequest;
import com.arooraa.aura.provider.TranscriptionResult;
import com.arooraa.aura.voice.config.VoiceProperties;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.TimeUnit;

/**
 * The voice channel's application service — and deliberately nothing more than a channel.
 *
 * <p>It converts audio to text and text to audio. It does not classify, retrieve, generate or
 * guard anything, and it has no idea what a conversation is. That is the architectural line this
 * milestone is built around: a transcript produced here is handed back to the browser, which sends
 * it through the ordinary chat endpoint, so a spoken question passes the same input validation,
 * the same scope and confidentiality classification, the same evidence gate and the same output
 * guardrail as a typed one. There is no second pipeline for voice to bypass anything with,
 * because there is no second pipeline.
 *
 * <p>Nothing recorded is persisted. Audio exists as a byte array for the length of one request and
 * is never written to disk, never stored in a column, and never embedded — no voice recording can
 * become Aura knowledge, because nothing here can reach the ingestion path at all.
 */
@Service
public class VoiceService {

    private static final Logger log = LoggerFactory.getLogger(VoiceService.class);

    private final SpeechTranscriptionProvider transcriptionProvider;
    private final SpeechSynthesisProvider synthesisProvider;
    private final AudioUploadValidator validator;
    private final SpeechTextPreparer speechTextPreparer;
    private final VoiceProperties properties;
    private final Timer transcriptionLatency;
    private final Timer synthesisLatency;

    public VoiceService(SpeechTranscriptionProvider transcriptionProvider,
                         SpeechSynthesisProvider synthesisProvider,
                         AudioUploadValidator validator,
                         SpeechTextPreparer speechTextPreparer,
                         VoiceProperties properties,
                         MeterRegistry meterRegistry) {
        this.transcriptionProvider = transcriptionProvider;
        this.synthesisProvider = synthesisProvider;
        this.validator = validator;
        this.speechTextPreparer = speechTextPreparer;
        this.properties = properties;
        this.transcriptionLatency = meterRegistry.timer("aura.voice.transcription.latency");
        this.synthesisLatency = meterRegistry.timer("aura.voice.synthesis.latency");
    }

    /**
     * @throws InvalidAudioException if the upload fails any bound — before a provider is called
     * @throws VoiceUnavailableException if voice is off, or the provider failed
     */
    public Transcript transcribe(MultipartFile file, Integer declaredDurationMillis) {
        if (!transcriptionProvider.isEnabled()) {
            throw new VoiceUnavailableException("TRANSCRIPTION_UNAVAILABLE",
                    "I can't listen right now — type it to me instead?");
        }
        ValidatedAudio audio = validator.validate(file, declaredDurationMillis);

        long startedAt = System.nanoTime();
        TranscriptionResult result;
        try {
            result = transcriptionProvider.transcribe(new TranscriptionRequest(
                    audio.bytes(), audio.mimeType(), audio.filename(), languageHint()));
        } catch (ProviderTransientException | ProviderPermanentException e) {
            // The code is safe to log — the adapter puts nothing vendor-internal in it. The
            // visitor gets a sentence Aura would say, and never the provider's own words.
            log.warn("Transcription failed ({}).", e.getMessage());
            throw new VoiceUnavailableException("TRANSCRIPTION_FAILED",
                    "I couldn't quite make that out. Try saying it again?");
        }
        long latencyMs = (System.nanoTime() - startedAt) / 1_000_000;
        transcriptionLatency.record(latencyMs, TimeUnit.MILLISECONDS);

        // Length, not content: a transcript is a visitor's own words and is treated exactly as a
        // typed message would be — never logged, never stored here, never inspected.
        log.info("Aura voice: transcribed {} bytes in {}ms ({} characters).",
                audio.bytes().length, latencyMs, result.text().length());
        return new Transcript(result.text(), result.detectedLanguage(), latencyMs);
    }

    /**
     * Speaks text Aura has already produced. The caller passes the answer it is displaying, and
     * {@link SpeechTextPreparer} reduces it deterministically — no model, so no new claim can enter
     * between what is read and what is heard.
     */
    public Speech speak(String text, String languageHint) {
        if (!synthesisProvider.isEnabled()) {
            throw new VoiceUnavailableException("SYNTHESIS_UNAVAILABLE", "I can't speak right now.");
        }
        VoiceProperties.Synthesis synthesis = properties.synthesis();
        String spoken = speechTextPreparer.prepare(text, synthesis.maxCharacters());
        if (spoken.isBlank()) {
            throw new InvalidAudioException("NOTHING_TO_SPEAK", "There's nothing for me to say there.");
        }

        long startedAt = System.nanoTime();
        SynthesisResult result;
        try {
            result = synthesisProvider.synthesize(new SynthesisRequest(
                    spoken, synthesis.voice(), synthesis.format(), languageHint));
        } catch (ProviderTransientException | ProviderPermanentException e) {
            log.warn("Speech synthesis failed ({}).", e.getMessage());
            throw new VoiceUnavailableException("SYNTHESIS_FAILED", "I couldn't find my voice just then.");
        }
        long latencyMs = (System.nanoTime() - startedAt) / 1_000_000;
        synthesisLatency.record(latencyMs, TimeUnit.MILLISECONDS);

        log.info("Aura voice: spoke {} characters in {}ms.", spoken.length(), latencyMs);
        return new Speech(result.audio(), result.mimeType(), latencyMs);
    }

    private String languageHint() {
        String configured = properties.transcription().language();
        return configured == null || configured.isBlank() ? null : configured;
    }

    /** @param detectedLanguage advisory only — Aura's own detector still decides the reply's language */
    public record Transcript(String text, String detectedLanguage, long latencyMs) {
    }

    public record Speech(byte[] audio, String mimeType, long latencyMs) {
    }
}
