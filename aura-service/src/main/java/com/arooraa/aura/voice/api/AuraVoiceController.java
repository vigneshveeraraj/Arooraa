package com.arooraa.aura.voice.api;

import com.arooraa.aura.conversation.UnknownConversationException;
import com.arooraa.aura.voice.InvalidAudioException;
import com.arooraa.aura.voice.SpokenAnswerService;
import com.arooraa.aura.voice.VoiceService;
import com.arooraa.aura.voice.VoiceUnavailableException;
import com.arooraa.aura.voice.config.VoiceProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * The voice channel's HTTP surface — three routes, and only when a deployment has deliberately
 * asked for them.
 *
 * <p>Conditional on {@code aura.voice.enabled}, which defaults to false, so with voice off this
 * bean does not exist and the routes 404 rather than merely refusing. That is the same guarantee
 * the chat surface already gives, and for the same reason: "switched off" should mean there is
 * nothing there, not that something there says no.
 *
 * <p>The browser records audio and uploads it here; this service holds the credential and calls
 * the provider. No key, no provider name, no provider header and no provider error text ever
 * reaches the browser — the network path is browser to aura-service to provider, and never browser
 * straight to a provider. Every failure below is answered with a stable code and a sentence Aura
 * would say.
 */
@RestController
@RequestMapping("/api/v1/aura/voice")
@ConditionalOnProperty(prefix = "aura.voice", name = "enabled", havingValue = "true")
public class AuraVoiceController {

    private final VoiceService voiceService;
    private final SpokenAnswerService spokenAnswerService;
    private final VoiceProperties properties;

    public AuraVoiceController(VoiceService voiceService, SpokenAnswerService spokenAnswerService,
                                VoiceProperties properties) {
        this.voiceService = voiceService;
        this.spokenAnswerService = spokenAnswerService;
        this.properties = properties;
    }

    @GetMapping("/capabilities")
    public VoiceDtos.Capabilities capabilities() {
        return new VoiceDtos.Capabilities(
                properties.transcriptionEnabled(),
                properties.synthesisEnabled(),
                properties.audio().maxDurationSeconds());
    }

    /**
     * Speech in, text back — and nothing else happens here. The transcript is returned to the
     * browser, which shows it to the visitor and sends it as an ordinary message when they are
     * happy with it. A spoken question therefore reaches the pipeline through the same door a
     * typed one does, which is what makes "voice cannot bypass a guardrail" true by construction
     * rather than by a test.
     *
     * @param durationMs what the browser recorded, if it knows. Advisory — see
     *        {@code AudioUploadValidator}
     */
    @PostMapping(value = "/transcriptions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public VoiceDtos.TranscriptionResponse transcribe(@RequestParam("audio") MultipartFile audio,
                                                       @RequestParam(value = "durationMs", required = false)
                                                       Integer durationMs) {
        VoiceService.Transcript transcript = voiceService.transcribe(audio, durationMs);
        return new VoiceDtos.TranscriptionResponse(transcript.text(), transcript.detectedLanguage());
    }

    /**
     * Speaks an answer Aura has already given. The body names a conversation and optionally a
     * turn; it cannot carry text. See {@link SpokenAnswerService} for why that restriction is the
     * design rather than an inconvenience.
     */
    @PostMapping(value = "/speech", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> speak(@RequestBody(required = false) VoiceDtos.SpeakRequest request) {
        if (request == null || request.conversationId() == null) {
            throw new InvalidAudioException("NOTHING_TO_SPEAK", "There's nothing for me to say yet.");
        }
        VoiceService.Speech speech = spokenAnswerService.speak(request.conversationId(), request.sequence());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, speech.mimeType())
                // Aura's voice is not a static asset. Nothing is stored here and nothing should be
                // kept downstream either — a replay asks again.
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(speech.audio());
    }

    // An upload over the container ceiling never reaches this class: the multipart resolver
    // rejects it before handler mapping, so it is answered by VoiceUploadExceptionHandler.

    /** The visitor's recording to fix — a short one, a silent one, a format we cannot read. */
    @ExceptionHandler(InvalidAudioException.class)
    public ResponseEntity<VoiceDtos.ErrorResponse> handleInvalidAudio(InvalidAudioException e) {
        return ResponseEntity.badRequest().body(new VoiceDtos.ErrorResponse(e.getCode(), e.getMessage()));
    }

    /** Ours to fix — voice switched off, or a provider that did not answer. */
    @ExceptionHandler(VoiceUnavailableException.class)
    public ResponseEntity<VoiceDtos.ErrorResponse> handleUnavailable(VoiceUnavailableException e) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new VoiceDtos.ErrorResponse(e.getCode(), e.getMessage()));
    }

    /** Says nothing about whether the identifier is malformed, expired or simply someone else's. */
    @ExceptionHandler(UnknownConversationException.class)
    public ResponseEntity<VoiceDtos.ErrorResponse> handleUnknownConversation(UnknownConversationException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new VoiceDtos.ErrorResponse("CONVERSATION_NOT_FOUND", "That conversation isn't available."));
    }
}
