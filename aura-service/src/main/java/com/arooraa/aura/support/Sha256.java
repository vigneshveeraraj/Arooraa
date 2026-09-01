package com.arooraa.aura.support;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Deterministic content fingerprinting shared by document-import idempotency (checksum a whole
 * source file) and chunk fingerprinting (checksum one chunk's text) — the same primitive, so both
 * layers agree on what "unchanged" means.
 */
public final class Sha256 {

    private Sha256() {
    }

    public static String hex(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is a JDK-guaranteed algorithm (java.security.MessageDigest spec) — this
            // branch is unreachable on any conforming JVM.
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
