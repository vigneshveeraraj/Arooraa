package com.arooraa.aura.discovery.handoff;

/**
 * The default. Discovery conversations work perfectly well without anywhere to send them — a
 * visitor can talk through an idea, see the summary and correct it — and only the last step needs
 * the Start Project workflow to be configured and reachable.
 */
public class DisabledProjectEnquiryClient implements ProjectEnquiryClient {

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public EnquiryReceipt submit(ProjectEnquirySubmission submission, String idempotencyKey) {
        throw new HandoffUnavailableException("HANDOFF_DISABLED",
                "I can't pass this to the team from here yet — the contact page is the way through for now.");
    }
}
