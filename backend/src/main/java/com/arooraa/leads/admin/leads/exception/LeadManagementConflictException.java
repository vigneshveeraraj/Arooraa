package com.arooraa.leads.admin.leads.exception;

/** Raised when an optimistic-locking version conflict is detected on a management update. */
public class LeadManagementConflictException extends RuntimeException {

    public LeadManagementConflictException(String message) {
        super(message);
    }
}
