package com.arooraa.aura.retention;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * How long Aura keeps anything (A8).
 *
 * <p>Two windows, because two different things are being kept and they justify themselves
 * differently.
 *
 * @param enabled whether old data is deleted at all. On by default, because a retention policy
 *        that has to be switched on is a retention policy nobody has
 * @param conversationDays how long a conversation and its messages live. This is the one that
 *        matters: a message is a visitor's own words, and there is no reason to hold somebody's
 *        description of their business indefinitely once the conversation is over and anything
 *        they asked us to act on has become an enquiry in its own right. Ninety days is long
 *        enough to investigate a complaint about an answer and short enough to be a real limit
 * @param eventDays how long the counted events live. Longer, because they contain nothing anybody
 *        said — a mode, an evidence level, a latency — and a year lets one season be compared with
 *        the last, which is most of what the numbers are for
 */
@ConfigurationProperties(prefix = "aura.retention")
public record RetentionProperties(Boolean enabled, Integer conversationDays, Integer eventDays) {

    public RetentionProperties {
        enabled = enabled == null || enabled;
        conversationDays = conversationDays == null || conversationDays < 1 ? 90 : conversationDays;
        eventDays = eventDays == null || eventDays < 1 ? 365 : eventDays;
    }
}
