package com.arooraa.leads.careers.storage;

/**
 * Private résumé storage, kept behind an interface so filesystem storage (this milestone's
 * Hostinger-appropriate choice — see FilesystemResumeStorage) can be replaced by object storage
 * later without touching {@code JobApplicationService} (W3.3B §7).
 *
 * <p>The stage/promote/discard split exists for transactional honesty (W3.3B §10): a résumé
 * write and a database insert can never commit as one atomic operation, so this interface makes
 * the two-phase reality explicit instead of hiding it. The intended call sequence, all
 * documented on {@link com.arooraa.leads.careers.service.JobApplicationService}:
 * <ol>
 *   <li>{@link #stage} — write validated bytes to a temporary location under a fresh,
 *       server-generated key. No database row exists yet.</li>
 *   <li>the database transaction runs (application row insert, referencing this key)</li>
 *   <li>on commit: {@link #promote} moves the staged file to its permanent location</li>
 *   <li>on failure: {@link #discard} removes the staged file so nothing orphaned survives</li>
 * </ol>
 */
public interface ResumeStorage {

    /** Generates a fresh storage key and writes {@code resume}'s bytes to temporary storage under it. */
    String stage(ValidatedResume resume);

    /** Moves the staged file at {@code storageKey} to permanent storage. Called only after the owning DB commit succeeds. */
    void promote(String storageKey);

    /** Deletes the staged temporary file at {@code storageKey}. Called when the owning DB transaction failed. */
    void discard(String storageKey);
}
