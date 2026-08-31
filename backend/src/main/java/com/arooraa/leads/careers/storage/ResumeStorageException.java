package com.arooraa.leads.careers.storage;

/** A filesystem I/O failure while staging, promoting or discarding a résumé — never wraps résumé content in its message. */
public class ResumeStorageException extends RuntimeException {

    public ResumeStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
