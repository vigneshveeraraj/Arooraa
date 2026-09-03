package com.arooraa.aura.discovery.handoff;

/**
 * What the Start Project workflow gave back. The reference is the only part shown to a visitor —
 * it is what they would quote if they wrote to us — and the only part stored on the brief.
 */
public record EnquiryReceipt(String reference, String message) {
}
