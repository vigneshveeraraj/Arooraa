package com.arooraa.aura.conversation.pipeline;

import java.util.Map;
import java.util.Optional;

/**
 * The deterministic map from a known public frontend route to what that page is about.
 *
 * <p>A4.1's page-awareness fix — "tell me more about this" on {@code /products/mesa} must resolve
 * to MESA — needs a canonical subject, and that subject may only ever come from this fixed
 * registry, never from the client. {@code currentPath} is context, not authorization (see
 * {@code AuraChatController} and {@code PromptComposer}): an unrecognised path resolves to nothing
 * rather than to a guess, so an arbitrary client-supplied string can never select a subject, widen
 * retrieval, or otherwise change what a turn may see.
 *
 * <p>Mirrors the routes the frontend actually serves ({@code frontend-v2/src/lib/content}) — kept
 * here rather than derived from them because the two projects share no build. A route this
 * registry does not know about simply produces no subject rather than a stale or guessed one.
 */
public final class PageContextRegistry {

    public record PageSubject(String name) {
    }

    private static final Map<String, PageSubject> KNOWN_PAGES = Map.ofEntries(
            Map.entry("/products/mesa", new PageSubject("MESA")),
            Map.entry("/products/mindra", new PageSubject("Mindra")),
            Map.entry("/products/smart-mirror", new PageSubject("Smart Mirror")),
            Map.entry("/products/smart-home-eb", new PageSubject("Arooraa Smart Home")),
            Map.entry("/services/product-discovery", new PageSubject("Product Strategy & Discovery")),
            Map.entry("/services/product-engineering", new PageSubject("Product Engineering")),
            Map.entry("/services/ai-automation", new PageSubject("AI, Data & Automation")),
            Map.entry("/services/application-modernization", new PageSubject("Application Modernization")),
            Map.entry("/services/cloud-platform", new PageSubject("Cloud & Platform Engineering")),
            Map.entry("/services/continuous-engineering", new PageSubject("Continuous Engineering")),
            Map.entry("/about", new PageSubject("AROORAA")),
            Map.entry("/careers", new PageSubject("AROORAA careers")),
            Map.entry("/start-project", new PageSubject("starting a project with AROORAA")),
            Map.entry("/contact", new PageSubject("contacting AROORAA")));

    private PageContextRegistry() {
    }

    /**
     * Exact match only, against the path portion alone — a query string, a hash, or a trailing
     * slash does not create a new route, but it also is not silently rewritten into one that exists;
     * it is simply stripped before the lookup.
     */
    public static Optional<PageSubject> resolve(String currentPath) {
        if (currentPath == null) {
            return Optional.empty();
        }
        String path = currentPath.strip();
        int cut = path.length();
        int query = path.indexOf('?');
        if (query >= 0) {
            cut = Math.min(cut, query);
        }
        int hash = path.indexOf('#');
        if (hash >= 0) {
            cut = Math.min(cut, hash);
        }
        path = path.substring(0, cut);
        if (path.length() > 1 && path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        return Optional.ofNullable(KNOWN_PAGES.get(path));
    }
}
