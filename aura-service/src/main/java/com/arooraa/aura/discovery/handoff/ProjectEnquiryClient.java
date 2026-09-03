package com.arooraa.aura.discovery.handoff;

/**
 * The Start Project workflow, as this service sees it: one call, one receipt.
 *
 * <p>An interface for the same reason every provider in this codebase is one — the caller must not
 * know or care that it happens to be an HTTP call to lead-service — and because a disabled
 * implementation is what makes "voice and discovery work locally without a second service running"
 * true rather than aspirational.
 */
public interface ProjectEnquiryClient {

    /** False when no Start Project endpoint is configured. Callers must check before submitting. */
    boolean isEnabled();

    /**
     * @param idempotencyKey derived from the conversation, so a retried or duplicated request
     *        returns the original enquiry instead of creating a second one
     * @throws HandoffUnavailableException if the workflow could not be reached or refused the
     *         request. Never carries the other service's own error text
     */
    EnquiryReceipt submit(ProjectEnquirySubmission submission, String idempotencyKey);
}
