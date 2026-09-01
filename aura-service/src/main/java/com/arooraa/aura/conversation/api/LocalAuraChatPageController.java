package com.arooraa.aura.conversation.api;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Serves the manual chat page used for owner acceptance.
 *
 * <p>The page lives at {@code classpath:aura-test/index.html} rather than under {@code static/} on
 * purpose: anything in {@code static/} is served automatically by Spring Boot, which would publish
 * the page whether or not chat is enabled. Serving it through a bean that only exists when
 * {@code aura.chat.enabled=true} makes the page share exactly one switch with the API it talks to.
 *
 * <p>This is a testing surface, not the arooraa.com UI.
 */
@Controller
@ConditionalOnProperty(prefix = "aura.chat", name = "enabled", havingValue = "true")
public class LocalAuraChatPageController {

    @GetMapping("/aura-test")
    public ResponseEntity<String> page() throws IOException {
        String html = new ClassPathResource("aura-test/index.html")
                .getContentAsString(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .header("Cache-Control", "no-store")
                .body(html);
    }
}
