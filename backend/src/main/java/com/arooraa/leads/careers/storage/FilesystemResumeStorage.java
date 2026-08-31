package com.arooraa.leads.careers.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.Set;
import java.util.UUID;

/**
 * Filesystem-backed {@link ResumeStorage} — the practical choice for this milestone's Hostinger
 * deployment (W3.3B §7): no object-storage credentials/infrastructure exist yet, and a single
 * VM's local disk, kept outside the web root and never served by Nginx, is a private and
 * sufficient store for this volume. {@code storageDir} must be configured via
 * {@code AROORAA_RECRUITMENT_RESUME_STORAGE_DIR} to a path outside anything Nginx or this
 * application serves as static content — see .env.example and the deployment docs.
 *
 * <p>Every stored file's name is a server-generated random key (never the candidate's filename
 * or anything derived from client input), so a predictable-URL or path-traversal attack has
 * nothing to work with even if the directory were ever accidentally exposed.
 *
 * <p><b>No malware scanning exists.</b> This class does not claim to scan uploaded files — see
 * the class Javadoc on {@code ResumeValidator} and the milestone completion report's "known
 * limitations" for what is and isn't covered. Storage stays private specifically because no
 * scanning exists.
 */
@Component
public class FilesystemResumeStorage implements ResumeStorage {

    private static final Logger log = LoggerFactory.getLogger(FilesystemResumeStorage.class);
    private static final Set<PosixFilePermission> PRIVATE_FILE_PERMISSIONS =
            PosixFilePermissions.fromString("rw-------");

    private final Path tempDir;
    private final Path finalDir;

    public FilesystemResumeStorage(@Value("${arooraa.recruitment.resume.storage-dir}") String storageDir) {
        Path root = Path.of(storageDir);
        this.tempDir = root.resolve("tmp");
        this.finalDir = root.resolve("applications");
        try {
            Files.createDirectories(tempDir);
            Files.createDirectories(finalDir);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Unable to create resume storage directories under " + storageDir
                            + " — check AROORAA_RECRUITMENT_RESUME_STORAGE_DIR points to a writable path.", e);
        }
    }

    @Override
    public String stage(ValidatedResume resume) {
        String storageKey = UUID.randomUUID() + "." + resume.extension();
        Path target = tempDir.resolve(storageKey);
        try {
            Files.write(target, resume.content(), StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
            trySetPrivatePermissions(target);
        } catch (IOException e) {
            throw new ResumeStorageException("Unable to stage resume upload.", e);
        }
        return storageKey;
    }

    @Override
    public void promote(String storageKey) {
        Path source = tempDir.resolve(storageKey);
        Path target = finalDir.resolve(storageKey);
        try {
            // ATOMIC_MOVE within the same filesystem (tmp/ and applications/ are both under
            // the same storage root) means there is no window where the file exists in
            // neither location — the crash-window this leaves open is documented on
            // JobApplicationService, not here (W3.3B §10).
            Files.move(source, target, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResumeStorageException("Unable to finalize resume storage.", e);
        }
    }

    @Override
    public void discard(String storageKey) {
        try {
            Files.deleteIfExists(tempDir.resolve(storageKey));
        } catch (IOException e) {
            log.warn("resume-storage discard failed storageKeySuffix={}", suffix(storageKey));
        }
    }

    private static void trySetPrivatePermissions(Path path) {
        try {
            Files.setPosixFilePermissions(path, PRIVATE_FILE_PERMISSIONS);
        } catch (UnsupportedOperationException | IOException e) {
            // Non-POSIX filesystem (e.g. local Windows dev) — directory-level privacy still
            // applies; this is best-effort defense in depth, not the only control.
        }
    }

    /** Never logs a full storage key or filename — only enough to correlate log lines, never enough to guess a path. */
    private static String suffix(String storageKey) {
        return storageKey.length() > 8 ? storageKey.substring(storageKey.length() - 8) : storageKey;
    }
}
