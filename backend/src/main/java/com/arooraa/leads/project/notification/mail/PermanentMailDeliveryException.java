package com.arooraa.leads.project.notification.mail;

/** Failure no retry can fix — malformed recipient, invalid configuration, a clear permanent rejection. */
public final class PermanentMailDeliveryException extends MailDeliveryException {

    public PermanentMailDeliveryException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}
