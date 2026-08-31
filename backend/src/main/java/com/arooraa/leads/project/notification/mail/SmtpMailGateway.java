package com.arooraa.leads.project.notification.mail;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailParseException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.io.UnsupportedEncodingException;

/**
 * The only class in this codebase that talks to {@link JavaMailSender}/SMTP directly — every
 * caller goes through {@link MailGateway} instead (W3.2C §4). Classifies Spring's mail exception
 * hierarchy into retryable-vs-permanent without inventing a large taxonomy (W3.2C §17):
 * authentication failures and unparseable addresses are configuration/input problems no retry
 * fixes; anything else surfaced as a send failure (connection reset, timeout, temporary SMTP
 * rejection) is treated as transient.
 */
public class SmtpMailGateway implements MailGateway {

    private final JavaMailSender javaMailSender;

    public SmtpMailGateway(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Override
    public void send(MailMessage message) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            // multipart=true + the (text, html) addBody overload produces a real text/plain
            // alternative part, not just an HTML body (W3.2C §40).
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(message.to().toArray(new String[0]));
            // setFrom(from, personal) builds a real RFC 2047-encoded InternetAddress (personal
            // name safely encoded if non-ASCII) using the UTF-8 encoding configured above —
            // this is what makes an inbox show "AROORAA" instead of the bare mailbox address.
            if (message.fromDisplayName() != null && !message.fromDisplayName().isBlank()) {
                helper.setFrom(message.from(), message.fromDisplayName());
            } else {
                helper.setFrom(message.from());
            }
            if (message.replyTo() != null && !message.replyTo().isBlank()) {
                helper.setReplyTo(message.replyTo());
            }
            helper.setSubject(message.subject());
            helper.setText(message.textBody(), message.htmlBody());

            javaMailSender.send(mimeMessage);
        } catch (MailAuthenticationException e) {
            throw new PermanentMailDeliveryException("SMTP_AUTH_FAILED", "Mail authentication failed.", e);
        } catch (MailParseException | UnsupportedEncodingException e) {
            throw new PermanentMailDeliveryException("SMTP_INVALID_ADDRESS", "Malformed sender/recipient address.", e);
        } catch (MailSendException | jakarta.mail.MessagingException e) {
            throw new RetryableMailDeliveryException("SMTP_SEND_FAILED", "Mail send failed.", e);
        } catch (MailException e) {
            throw new RetryableMailDeliveryException("SMTP_UNKNOWN_ERROR", "Mail send failed.", e);
        }
    }
}
