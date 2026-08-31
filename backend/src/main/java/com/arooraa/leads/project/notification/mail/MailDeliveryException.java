package com.arooraa.leads.project.notification.mail;

/** Base for the two outcomes a {@link MailGateway} can fail with — see its Javadoc. */
public sealed abstract class MailDeliveryException extends RuntimeException
        permits RetryableMailDeliveryException, PermanentMailDeliveryException {

    private final String errorCode;

    protected MailDeliveryException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String errorCode() {
        return errorCode;
    }
}
