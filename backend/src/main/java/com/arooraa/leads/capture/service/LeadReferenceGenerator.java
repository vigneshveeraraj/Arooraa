package com.arooraa.leads.capture.service;

import com.arooraa.leads.capture.repository.LeadCaptureRepository;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.regex.Pattern;

/**
 * Opaque lead references like "LC-7Q2M9X". Unlike the CNT-/ARO- counters these are random:
 * the reference travels in a WhatsApp URL, so it must reveal nothing — not volume, not order,
 * and nothing about the phone number. 31^6 (~887 million) values from an alphabet without
 * look-alike characters (0/O, 1/I/L); a collision is retried, and the unique constraint on
 * lead_reference is the final guard.
 */
@Component
public class LeadReferenceGenerator {

    static final String ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private static final int LENGTH = 6;
    private static final int MAX_ATTEMPTS = 5;

    /** Finds a reference inside free text, e.g. the prefilled wa.me message. Case-insensitive. */
    public static final Pattern IN_TEXT = Pattern.compile("(?i)\\bLC-([" + ALPHABET + "]{" + LENGTH + "})\\b");

    private final SecureRandom random = new SecureRandom();
    private final LeadCaptureRepository repository;

    public LeadReferenceGenerator(LeadCaptureRepository repository) {
        this.repository = repository;
    }

    public String next() {
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String candidate = randomReference();
            if (!repository.existsByLeadReference(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Could not allocate a unique lead reference");
    }

    String randomReference() {
        StringBuilder sb = new StringBuilder("LC-");
        for (int i = 0; i < LENGTH; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
