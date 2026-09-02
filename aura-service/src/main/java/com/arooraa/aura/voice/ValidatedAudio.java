package com.arooraa.aura.voice;

/**
 * An upload that has passed every check, expressed as a type the rest of the voice path can only
 * obtain from {@link AudioUploadValidator}. The filename is one this service generated; the
 * client's own is discarded at the edge and exists nowhere downstream.
 */
public record ValidatedAudio(byte[] bytes, String mimeType, String filename) {
}
