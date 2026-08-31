package com.arooraa.leads.contact.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.time.ZoneOffset;

/**
 * Generates human-readable references like "CNT-2026-000001" (W3.4 §10) — same atomic-upsert
 * counter pattern as EnquiryNumberGenerator/ApplicationReferenceGenerator, its own counter table
 * so Contact's sequence never collides with or shares state with sales/recruitment references.
 */
@Component
public class ContactReferenceGenerator {

    private static final String UPSERT_AND_RETURN = """
            INSERT INTO contact_message_reference_counters (year, last_value)
            VALUES (?, 1)
            ON CONFLICT (year)
            DO UPDATE SET last_value = contact_message_reference_counters.last_value + 1
            RETURNING last_value
            """;

    private final JdbcTemplate jdbcTemplate;

    public ContactReferenceGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String next() {
        int year = Year.now(ZoneOffset.UTC).getValue();
        Long sequence = jdbcTemplate.queryForObject(UPSERT_AND_RETURN, Long.class, year);
        return "CNT-%d-%06d".formatted(year, sequence);
    }
}
