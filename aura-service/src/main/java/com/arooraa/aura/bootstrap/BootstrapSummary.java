package com.arooraa.aura.bootstrap;

import java.util.List;

/**
 * What one bootstrap run did, by document slug. Slugs and statuses only — never document content,
 * never a source path's contents, so the log of a run is safe to paste anywhere.
 *
 * @param indexed documents now INDEXED and active in this database
 * @param unchanged documents that were already current — the idempotent path
 * @param skipped documents deliberately not indexed, each with the reason
 * @param failed documents whose import or ingestion failed, each with a short error code
 */
public record BootstrapSummary(
        List<String> indexed,
        List<String> unchanged,
        List<String> skipped,
        List<String> failed) {

    public int total() {
        return indexed.size() + unchanged.size() + skipped.size() + failed.size();
    }
}
