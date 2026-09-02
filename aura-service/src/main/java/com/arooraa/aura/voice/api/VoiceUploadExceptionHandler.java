package com.arooraa.aura.voice.api;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * Advice rather than a handler method on {@link AuraVoiceController}, and the distinction is not
 * cosmetic: an upload over {@code spring.servlet.multipart.max-file-size} is rejected by the
 * multipart resolver during {@code DispatcherServlet.checkMultipart}, which runs <em>before</em>
 * handler mapping. There is no handler yet when it is thrown, so a controller-scoped
 * {@code @ExceptionHandler} — including one restricted by {@code assignableTypes} — never sees it,
 * and the visitor gets the container's default error page instead of something Aura would say.
 *
 * <p>Registered only when voice is on, because it is only reachable when voice is on: this service
 * has no other multipart endpoint, so a global advice for this one exception costs nothing and
 * belongs to exactly one feature.
 */
@RestControllerAdvice
@ConditionalOnProperty(prefix = "aura.voice", name = "enabled", havingValue = "true")
public class VoiceUploadExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<VoiceDtos.ErrorResponse> handleOversizeUpload(MaxUploadSizeExceededException e) {
        // Deliberately the same code and the same sentence the validator uses for a recording that
        // is merely over our own ceiling. From the visitor's side the two are one problem, and the
        // difference between them is a detail about our container that is none of their business.
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(new VoiceDtos.ErrorResponse(
                "AUDIO_TOO_LARGE", "That recording is longer than I can take in one go."));
    }
}
