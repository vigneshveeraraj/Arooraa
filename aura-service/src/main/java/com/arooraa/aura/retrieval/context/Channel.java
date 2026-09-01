package com.arooraa.aura.retrieval.context;

/**
 * How the visitor is reaching this {@link AssistantProfile} (e.g. the public website widget vs.
 * a future authenticated in-product surface) — a second axis alongside profile that
 * {@link com.arooraa.aura.retrieval.access.AccessPolicy} can authorize against. A plain value for
 * the same reason as {@link AssistantProfile}. A2 defines exactly one.
 */
public record Channel(String code) {

    public static final Channel PUBLIC_WEB = new Channel("PUBLIC_WEB");
}
