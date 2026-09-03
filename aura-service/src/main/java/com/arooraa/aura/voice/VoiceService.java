package com.arooraa.aura.voice;

import com.arooraa.aura.provider.ProviderPermanentException;
import com.arooraa.aura.provider.ProviderTransientException;
import com.arooraa.aura.protection.DailyCallBudget;
import com.arooraa.aura.provider.SpeechSynthesisProvider;
import com.arooraa.aura.provider.SpeechTranscriptionProvider;
import com.arooraa.aura.provider.SynthesisRequest;
import com.arooraa.aura.provider.SynthesisResult;
import com.arooraa.aura.provider.TranscriptionRequest;
import com.arooraa.aura.provider.TranscriptionResult;
import com.arooraa.aura.insight.AuraInsightRecorder;
import com.arooraa.aura.insight.domain.AuraEventType;
import com.arooraa.aura.vocabulary.EntityResolution;
import com.arooraa.aura.vocabulary.PublicEntityResolver;
import com.arooraa.aura.voice.config.VoiceProperties;
import io.micrometer.core.instrument.DistributionSummary;
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
 * <p>A5.2 adds one step on the way out, and only one: the transcript is passed through
 * {@link PublicEntityResolver}, so a visitor who said "MESA" and was heard as "Meesa" sees MESA in
 * the composer and confirms a question Aura can actually answer. That is a recognition aid over a
 * fixed list of AROORAA's own public names — it corrects nothing else a visitor says, and it does
 * not make voice a second pipeline: the canonical transcript still goes back to the browser and
 * still re-enters through the ordinary chat endpoint.
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
    private final DistributionSummary recordingDuration;
    private final DistributionSummary recordingBytes;
    private final MeterRegistry meterRegistry;
    private final AuraInsightRecorder insightRecorder;
    private final DailyCallBudget budget;
    private final PublicEntityResolver entityResolver;

    public VoiceService(SpeechTranscriptionProvider transcriptionProvider,
                         SpeechSynthesisProvider synthesisProvider,
                         AudioUploadValidator validator,
                         SpeechTextPreparer speechTextPreparer,
                         VoiceProperties properties,
                         MeterRegistry meterRegistry,
                         AuraInsightRecorder insightRecorder,
                         DailyCallBudget budget,
                         PublicEntityResolver entityResolver) {
        this.transcriptionProvider = transcriptionProvider;
        this.synthesisProvider = synthesisProvider;
        this.validator = validator;
        this.speechTextPreparer = speechTextPreparer;
        this.properties = properties;
        this.meterRegistry = meterRegistry;
        this.insightRecorder = insightRecorder;
        this.budget = budget;
        this.entityResolver = entityResolver;
        this.transcriptionLatency = meterRegistry.timer("aura.voice.transcription.latency");
        this.synthesisLatency = meterRegistry.timer("aura.voice.synthesis.latency");
        // How long people actually speak for, and how much that costs to upload. Both are needed
        // to tell "transcription is slow" from "people are recording thirty-second questions", and
        // neither can be inferred from a latency number alone.
        this.recordingDuration = DistributionSummary.builder("aura.voice.recording.duration")
                .baseUnit("milliseconds").register(meterRegistry);
        this.recordingBytes = DistributionSummary.builder("aura.voice.recording.size")
                .baseUnit("bytes").register(meterRegistry);
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
        // After validation and before the provider (A8): a request that was never going to be
        // accepted should be refused on its own terms, and today's ceiling should not be spent
        // proving it. The visitor is told voice is unavailable, which is true, and can type.
        if (!budget.tryConsume(DailyCallBudget.Kind.TRANSCRIPTION)) {
            throw new VoiceUnavailableException("TRANSCRIPTION_UNAVAILABLE",
                    "I can't listen right now — type it to me instead?");
        }
        recordingBytes.record(audio.bytes().length);
        if (declaredDurationMillis != null) {
            recordingDuration.record(declaredDurationMillis);
        }

        long startedAt = System.nanoTime();
        TranscriptionResult result;
        try {
            result = transcriptionProvider.transcribe(new TranscriptionRequest(
                    audio.bytes(), audio.mimeType(), audio.filename(), languageHint()));
        } catch (ProviderTransientException | ProviderPermanentException e) {
            // The code is safe to log — the adapter puts nothing vendor-internal in it. The
            // visitor gets a sentence Aura would say, and never the provider's own words.
            log.warn("Transcription failed ({}).", e.getMessage());
            countFailure("transcription", e);
            insightRecorder.voice(AuraEventType.VOICE_TRANSCRIPTION_FAILED, null, kindOf(e));
            throw new VoiceUnavailableException("TRANSCRIPTION_FAILED",
                    "I couldn't quite make that out. Try saying it again?");
        }
        long latencyMs = (System.nanoTime() - startedAt) / 1_000_000;
        transcriptionLatency.record(latencyMs, TimeUnit.MILLISECONDS);

        // The provider's words, and then our own names spelled our way. Both are kept: the raw
        // transcript is what the provider actually returned and stays available to whoever is
        // diagnosing a bad recognition, and the canonical one is what the visitor is shown.
        EntityResolution understood = entityResolver.resolve(result.text());
        for (String entity : understood.canonicalNames()) {
            // Which of our own names a recording turned out to be about — never a word of what was
            // said. A rise here alongside a rise in knowledge gaps is the shape of "the microphone
            // hears the name but the corpus has nothing to say about it".
            meterRegistry.counter("aura.voice.transcript.canonicalised", "entity", entity).increment();
        }

        // Length, not content: a transcript is a visitor's own words and is treated exactly as a
        // typed message would be — never logged, never stored here, never inspected.
        insightRecorder.voice(AuraEventType.VOICE_TRANSCRIBED, null, null);
        log.info("Aura voice: transcribed {} bytes in {}ms ({} characters, recognised {}).",
                audio.bytes().length, latencyMs, result.text().length(), understood.canonicalNames());
        return new Transcript(understood.canonicalText(), result.text(), result.detectedLanguage(), latencyMs);
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
        if (!budget.tryConsume(DailyCallBudget.Kind.SYNTHESIS)) {
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
            countFailure("synthesis", e);
            insightRecorder.voice(AuraEventType.VOICE_SYNTHESIS_FAILED, null, kindOf(e));
            throw new VoiceUnavailableException("SYNTHESIS_FAILED", "I couldn't find my voice just then.");
        }
        long latencyMs = (System.nanoTime() - startedAt) / 1_000_000;
        synthesisLatency.record(latencyMs, TimeUnit.MILLISECONDS);

        insightRecorder.voice(AuraEventType.VOICE_SPOKEN, null, null);
        log.info("Aura voice: spoke {} characters in {}ms.", spoken.length(), latencyMs);
        return new Speech(result.audio(), result.mimeType(), latencyMs);
    }

    /**
     * Counts a provider failure by which half of voice it was and whether it might have succeeded
     * on a retry — the difference between "our key is wrong" and "the provider is having a bad
     * afternoon", which is the first thing anyone looking at a spike needs to know.
     *
     * <p>Tagged with the shape of the failure, never with its message: a provider's own error text
     * is not something to put in a metric label, where it would multiply the time series and could
     * carry detail we have been careful not to log.
     */
    private void countFailure(String stage, RuntimeException failure) {
        meterRegistry.counter("aura.voice.provider.failures", "stage", stage, "kind", kindOf(failure))
                .increment();
    }

    /** Whether it might have worked on a retry — the first thing anyone looking at a spike needs. */
    private String kindOf(RuntimeException failure) {
        return failure instanceof ProviderTransientException ? "transient" : "permanent";
    }

    private String languageHint() {
        String configured = properties.transcription().language();
        return configured == null || configured.isBlank() ? null : configured;
    }

    /**
     * @param text what the visitor is shown and confirms: the provider's transcript with any
     *        approved AROORAA public name written the way AROORAA writes it
     * @param rawText exactly what the provider returned, kept for diagnosing a bad recognition. Not
     *        published on the voice API — the browser has no use for it, and a transcript is the
     *        visitor's own words, which this service does not hand around more widely than it must
     * @param detectedLanguage advisory only — Aura's own detector still decides the reply's language
     */
    public record Transcript(String text, String rawText, String detectedLanguage, long latencyMs) {
    }

    public record Speech(byte[] audio, String mimeType, long latencyMs) {
    }
}
