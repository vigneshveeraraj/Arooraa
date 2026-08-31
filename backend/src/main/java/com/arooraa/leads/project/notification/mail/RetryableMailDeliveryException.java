package com.arooraa.leads.project.notification.mail;

/** Transient failure — network timeout, temporary SMTP error, provider unavailable, rate limit. */
public final class RetryableMailDeliveryException extends MailDeliveryException {

    public RetryableMailDeliveryException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}
