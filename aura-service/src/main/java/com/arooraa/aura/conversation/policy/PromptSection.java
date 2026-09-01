package com.arooraa.aura.conversation.policy;

/**
 * One labelled block of the composed system prompt.
 *
 * <p>The prompt is assembled from these rather than written as one long string so each rule has a
 * single home: personality lives in exactly one section, the confidentiality boundary in another,
 * and a change to one cannot silently reword the other. It also makes the prompt testable — a test
 * can assert that a boundary turn carries no evidence section at all, rather than grepping a wall
 * of text.
 */
public record PromptSection(String heading, String body) {

    public String render() {
        return "## " + heading + "\n" + body.strip();
    }
}
